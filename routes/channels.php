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

// Общий канал
Broadcast::channel('presence-channel', function ($user) {
    return ['id' => (int)$user->id, 'name' => $user->name];
});

// Чат Канал для новых сообщений
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    //return FriendRequest::areFriends($user->id, $userId);
    return (int)$user->id === (int)$userId;
});

// Канал для прочтения
Broadcast::channel('chat.read.{from_id}', function ($user, $from_id) {
    return (int)$user->id === (int)$from_id;
});

// Звонки
Broadcast::channel('call.{userId}', function ($user, $userId) {
    return (int)$user->id === (int)$userId;
});

// Присутствие
Broadcast::channel('presence-chat', function ($user) {
    return ['id' => (int)$user->id, 'name' => $user->name, 'avatar' => $user->avatar];
});

// Друзья
Broadcast::channel('friends.{userId}', function ($user, $userId) {
    return FriendRequest::areFriends((int)$user->id, (int)$userId);
});

// Для WebRTC сигналинга
Broadcast::channel('signal.{userId}', function ($user, $userId) {
    return (int)$user->id === (int)$userId;
});
