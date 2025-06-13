<?php

use App\Models\TalkStream\FriendRequest;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Чат
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return FriendRequest::areFriends($user->id, $userId);
});

// Звонки
Broadcast::channel('call.{userId}', function ($user, $userId) {
    return (int)$user->id === (int)$userId;
});

// Присутствие
Broadcast::channel('presence-chat', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});

// Друзья
Broadcast::channel('friends.{userId}', function ($user, $userId) {
    return FriendRequest::areFriends($user->id, $userId);
});

// Для WebRTC сигналинга
Broadcast::channel('signal.{userId}', function ($user, $userId) {
    return (int)$user->id === (int)$userId;
});
