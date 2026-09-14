import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  MessageSquare, Search, Users, UserPlus, LogOut, Send, Check, CheckCheck, 
  ShieldCheck, UserCheck, UserX, Clock, Sparkles, AlertCircle, ArrowLeft, MoreVertical 
} from 'lucide-react';

export const MessengerPage = () => {
  const { user, logout } = useAuth();
  
  // Tabs: 'chats' | 'search' | 'requests'
  const [activeTab, setActiveTab] = useState('chats');
  
  // Conversations & Friends state
  const [conversations, setConversations] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Friend requests state
  const [friendsList, setFriendsList] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);

  const messagesEndRef = useRef(null);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messenger/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  // Fetch friends & requests
  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriendsList(res.data.friends || []);
      setPendingReceived(res.data.pending_received || []);
      setPendingSent(res.data.pending_sent || []);
    } catch (err) {
      console.error('Failed to load friends', err);
    }
  };

  // Fetch messages for active chat
  const fetchMessages = async (friendId) => {
    if (!friendId) return;
    try {
      const res = await api.get(`/messages/${friendId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  // Initial load & polling for real-time feel (zero lag)
  useEffect(() => {
    fetchConversations();
    fetchFriends();

    const interval = setInterval(() => {
      fetchConversations();
      if (activeChatUser) {
        fetchMessages(activeChatUser.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChatUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Search Users
  useEffect(() => {
    const searchUsers = async () => {
      setSearching(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    const messageText = newMessage;
    setNewMessage('');

    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now(),
      sender_id: user.id,
      recipient_id: activeChatUser.id,
      message: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await api.post('/messages', {
        recipient_id: activeChatUser.id,
        message: messageText,
      });
      fetchMessages(activeChatUser.id);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Send Friend Request
  const handleSendRequest = async (friendId) => {
    try {
      await api.post('/friends/request', { friend_id: friendId });
      const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.users || []);
      fetchFriends();
    } catch (err) {
      console.error('Failed to send friend request', err);
    }
  };

  // Accept Friend Request
  const handleAcceptRequest = async (friendshipId) => {
    try {
      await api.post('/friends/accept', { friendship_id: friendshipId });
      fetchFriends();
      fetchConversations();
    } catch (err) {
      console.error('Failed to accept request', err);
    }
  };

  // Remove Friend / Reject Request
  const handleRemoveFriend = async (friendshipId) => {
    try {
      await api.post('/friends/remove', { friendship_id: friendshipId });
      fetchFriends();
      fetchConversations();
    } catch (err) {
      console.error('Failed to remove relationship', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 shadow-xs z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">Messenger</h1>
            <span className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online as {user?.name} (@{user?.username})</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full sm:w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Navigation Tabs */}
          <div className="p-3 border-b border-slate-100 grid grid-cols-3 gap-1 bg-slate-50">
            <button
              onClick={() => setActiveTab('chats')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'chats'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chats</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'search'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 relative ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Requests</span>
              {pendingReceived.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {pendingReceived.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content: Chats */}
          {activeTab === 'chats' && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              <div className="p-3 bg-slate-50/50 border-b border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Conversations</p>
              </div>
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <MessageSquare className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No conversations yet.</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-100"
                  >
                    Search users to chat
                  </button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveChatUser(conv);
                      fetchMessages(conv.id);
                    }}
                    className={`p-4 flex items-center space-x-3 cursor-pointer transition ${
                      activeChatUser?.id === conv.id ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {conv.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{conv.name}</h3>
                        <span className="text-[10px] text-slate-400">
                          {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.last_message || 'Start a conversation...'}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content: Search (Advanced Fuzzy Search) */}
          {activeTab === 'search' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Advanced User Search</p>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by first name, last name, username..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {searching ? (
                  <div className="p-8 text-center text-slate-400">Searching database...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No users found matching "{searchQuery}"</div>
                ) : (
                  searchResults.map((u) => (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                          <span className="text-xs text-slate-500">@{u.username}</span>
                        </div>
                      </div>

                      <div>
                        {u.friendship_status === 'friends' && (
                          <button
                            onClick={() => {
                              setActiveChatUser(u);
                              fetchMessages(u.id);
                              setActiveTab('chats');
                            }}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>
                        )}
                        {u.friendship_status === 'none' && (
                          <button
                            onClick={() => handleSendRequest(u.id)}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Friend</span>
                          </button>
                        )}
                        {u.friendship_status === 'pending_sent' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Requested</span>
                          </span>
                        )}
                        {u.friendship_status === 'pending_received' && (
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                            Pending You
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Requests */}
          {activeTab === 'requests' && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-4 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Friend Requests ({pendingReceived.length})
                </h3>
                {pendingReceived.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No pending friend requests.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingReceived.map((req) => (
                      <div key={req.friendship_id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {req.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{req.name}</h4>
                            <span className="text-xs text-slate-500">@{req.username}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptRequest(req.friendship_id)}
                            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition"
                            title="Accept"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(req.friendship_id)}
                            className="bg-rose-50 text-rose-600 p-2 rounded-lg hover:bg-rose-100 transition border border-rose-200"
                            title="Decline"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  My Friends ({friendsList.length})
                </h3>
                {friendsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No friends added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {friendsList.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setActiveChatUser(f);
                          fetchMessages(f.id);
                          setActiveTab('chats');
                        }}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {f.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                            <span className="text-xs text-slate-500">@{f.username}</span>
                          </div>
                        </div>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-semibold">
                          Message
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Right Chat Window */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {activeChatUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">
                      {activeChatUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{activeChatUser.name}</h2>
                    <span className="text-xs text-slate-500">@{activeChatUser.username} • Active now</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-400">
                  <button className="p-2 hover:bg-slate-100 rounded-full transition">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <MessageSquare className="w-12 h-12 text-slate-300" />
                    <p className="text-sm font-medium">Say hello to {activeChatUser.name}!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl text-sm shadow-xs ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{m.message}</p>
                          <div
                            className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
                              isMe ? 'text-indigo-200' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type a message to ${activeChatUser.name}...`}
                  className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-2xl transition shadow-md shadow-indigo-200 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-slate-50/50 p-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Your Messages</h2>
              <p className="text-sm text-slate-500 max-w-sm text-center">
                Select a conversation from the sidebar or use the search tab to find friends and start messaging instantly.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
