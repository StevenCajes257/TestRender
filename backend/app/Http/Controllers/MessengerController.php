<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessengerController extends Controller
{
    // Advanced fuzzy search for users
    public function searchUsers(Request $request)
    {
        $query = $request->input('q', '');
        $currentUser = $request->user();

        if (trim($query) === '') {
            $users = User::where('id', '!=', $currentUser->id)->limit(10)->get();
        } else {
            $users = User::where('id', '!=', $currentUser->id)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('username', 'LIKE', "%{$query}%")
                      ->orWhere('email', 'LIKE', "%{$query}%");
                })
                ->limit(20)
                ->get();
        }

        // Attach friendship status for each user
        $usersWithStatus = $users->map(function ($user) use ($currentUser) {
            $friendship = Friendship::where(function ($q) use ($currentUser, $user) {
                $q->where('user_id', $currentUser->id)->where('friend_id', $user->id);
            })->orWhere(function ($q) use ($currentUser, $user) {
                $q->where('user_id', $user->id)->where('friend_id', $currentUser->id);
            })->first();

            $status = 'none';
            $friendshipId = null;

            if ($friendship) {
                $friendshipId = $friendship->id;
                if ($friendship->status === 'accepted') {
                    $status = 'friends';
                } elseif ($friendship->user_id === $currentUser->id) {
                    $status = 'pending_sent';
                } else {
                    $status = 'pending_received';
                }
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'friendship_status' => $status,
                'friendship_id' => $friendshipId,
            ];
        });

        return response()->json([
            'users' => $usersWithStatus,
        ]);
    }

    // Get friends and requests
    public function getFriends(Request $request)
    {
        $currentUser = $request->user();

        $friendships = Friendship::where('user_id', $currentUser->id)
            ->orWhere('friend_id', $currentUser->id)
            ->with(['user', 'friend'])
            ->get();

        $friends = [];
        $pendingReceived = [];
        $pendingSent = [];

        foreach ($friendships as $fs) {
            $isUser1 = $fs->user_id === $currentUser->id;
            $otherUser = $isUser1 ? $fs->friend : $fs->user;

            if (!$otherUser) continue;

            $item = [
                'friendship_id' => $fs->id,
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'username' => $otherUser->username,
                'email' => $otherUser->email,
                'created_at' => $fs->created_at,
            ];

            if ($fs->status === 'accepted') {
                $friends[] = $item;
            } elseif ($fs->status === 'pending') {
                if ($isUser1) {
                    $pendingSent[] = $item;
                } else {
                    $pendingReceived[] = $item;
                }
            }
        }

        return response()->json([
            'friends' => $friends,
            'pending_received' => $pendingReceived,
            'pending_sent' => $pendingSent,
        ]);
    }

    // Send friend request
    public function sendFriendRequest(Request $request)
    {
        $request->validate([
            'friend_id' => ['required', 'exists:users,id'],
        ]);

        $currentUser = $request->user();
        $friendId = $request->friend_id;

        if ($currentUser->id == $friendId) {
            return response()->json(['message' => 'Cannot add yourself as a friend.'], 422);
        }

        $existing = Friendship::where(function ($q) use ($currentUser, $friendId) {
            $q->where('user_id', $currentUser->id)->where('friend_id', $friendId);
        })->orWhere(function ($q) use ($currentUser, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $currentUser->id);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Friendship or request already exists.'], 422);
        }

        $friendship = Friendship::create([
            'user_id' => $currentUser->id,
            'friend_id' => $friendId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Friend request sent successfully.',
            'friendship' => $friendship,
        ]);
    }

    // Accept friend request
    public function acceptFriendRequest(Request $request)
    {
        $request->validate([
            'friendship_id' => ['required', 'exists:friendships,id'],
        ]);

        $currentUser = $request->user();
        $friendship = Friendship::where('id', $request->friendship_id)
            ->where('friend_id', $currentUser->id)
            ->where('status', 'pending')
            ->first();

        if (! $friendship) {
            return response()->json(['message' => 'Friend request not found.'], 404);
        }

        $friendship->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Friend request accepted.',
        ]);
    }

    // Reject or remove friend
    public function removeFriend(Request $request)
    {
        $request->validate([
            'friendship_id' => ['required', 'exists:friendships,id'],
        ]);

        $currentUser = $request->user();
        $friendship = Friendship::where('id', $request->friendship_id)
            ->where(function ($q) use ($currentUser) {
                $q->where('user_id', $currentUser->id)->orWhere('friend_id', $currentUser->id);
            })
            ->first();

        if (! $friendship) {
            return response()->json(['message' => 'Relationship not found.'], 404);
        }

        $friendship->delete();

        return response()->json([
            'message' => 'Friend removed or request cancelled.',
        ]);
    }

    // Get conversations list (friends with last message)
    public function getConversations(Request $request)
    {
        $currentUser = $request->user();

        $friendships = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($currentUser) {
                $q->where('user_id', $currentUser->id)->orWhere('friend_id', $currentUser->id);
            })
            ->get();

        $friendIds = $friendships->map(function ($fs) use ($currentUser) {
            return $fs->user_id === $currentUser->id ? $fs->friend_id : $fs->user_id;
        });

        $friends = User::whereIn('id', $friendIds)->get();

        $conversations = $friends->map(function ($friend) use ($currentUser) {
            $lastMessage = Message::where(function ($q) use ($currentUser, $friend) {
                $q->where('sender_id', $currentUser->id)->where('recipient_id', $friend->id);
            })->orWhere(function ($q) use ($currentUser, $friend) {
                $q->where('sender_id', $friend->id)->where('recipient_id', $currentUser->id);
            })->latest()->first();

            $unreadCount = Message::where('sender_id', $friend->id)
                ->where('recipient_id', $currentUser->id)
                ->whereNull('read_at')
                ->count();

            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'username' => $friend->username,
                'email' => $friend->email,
                'last_message' => $lastMessage ? $lastMessage->message : null,
                'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                'unread_count' => $unreadCount,
            ];
        })->sortByDesc('last_message_time')->values();

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    // Get messages between current user and friend
    public function getMessages(Request $request, $friendId)
    {
        $currentUser = $request->user();

        $messages = Message::where(function ($q) use ($currentUser, $friendId) {
            $q->where('sender_id', $currentUser->id)->where('recipient_id', $friendId);
        })->orWhere(function ($q) use ($currentUser, $friendId) {
            $q->where('sender_id', $friendId)->where('recipient_id', $currentUser->id);
        })->orderBy('created_at', 'asc')->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }

    // Send a message
    public function sendMessage(Request $request)
    {
        $request->validate([
            'recipient_id' => ['required', 'exists:users,id'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $currentUser = $request->user();

        $message = Message::create([
            'sender_id' => $currentUser->id,
            'recipient_id' => $request->recipient_id,
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => 'Message sent',
            'data' => $message,
        ], 201);
    }
}
