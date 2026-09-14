<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessengerController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/realtime-stats', [AuthController::class, 'realtimeStats']);

    // Messenger & Friends
    Route::get('/users/search', [MessengerController::class, 'searchUsers']);
    Route::get('/friends', [MessengerController::class, 'getFriends']);
    Route::post('/friends/request', [MessengerController::class, 'sendFriendRequest']);
    Route::post('/friends/accept', [MessengerController::class, 'acceptFriendRequest']);
    Route::post('/friends/remove', [MessengerController::class, 'removeFriend']);
    Route::get('/messenger/conversations', [MessengerController::class, 'getConversations']);
    Route::get('/messages/{friendId}', [MessengerController::class, 'getMessages']);
    Route::post('/messages', [MessengerController::class, 'sendMessage']);
});
