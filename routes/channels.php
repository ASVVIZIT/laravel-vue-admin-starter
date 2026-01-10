<?php

use App\Models\TalkStream\FriendRequest;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

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

// Убедитесь, что используете правильную модель User
Broadcast::channel('private-user.{id}', function ($user, $id) {
    Log::info("Подписка на private-user.$id", [
        'user' => $user?->id,
        'id' => $id
    ]);
    return (int)$user?->id === (int)$id;
});

// Присутствие
/*Broadcast::channel('presence-chat', function ($user) {
    Log::info("Подписка на presence-chat", [
        'user' => $user?->id,
        'time' => now()->toDateTimeString()
    ]);

    //return true; // или верните true, если пользователь авторизован
    return $user->id; // или верните true, если пользователь авторизован
});*/

// Добавьте тестовый канал для диагностики
Broadcast::channel('test-channel', function ($user) {
    return true; // Разрешить всем аутентифицированным пользователям
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int)$user->id === (int)$id;
});

// Общий канал
Broadcast::channel('presence-chat', function ($user) {
    //return ['id' => (int)$user->id, 'name' => $user->name];
    return $user->id;
});

// Чат Канал для новых сообщений
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    //return FriendRequest::areFriends((int)$user->id, (int)$userId);
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

// Друзья
Broadcast::channel('friends.{userId}', function ($user, $userId) {
    return FriendRequest::areFriends((int)$user->id, (int)$userId);
});

// Для WebRTC сигналинга
Broadcast::channel('signal.{userId}', function ($user, $userId) {
    return (int)$user->id === (int)$userId;
});

/*Broadcast::channel('smart-light.device.{deviceId}', function ($user, $deviceId) {
    return true; // Доступ без аутентификации для устройств
});*/

Broadcast::channel('smart-light.device.{deviceId}', function ($user, $deviceId) {
    // Проверяем, имеет ли пользователь доступ к устройству
    $device = \App\Models\SmartLight\SmartLightDevice::where('device_id', $deviceId)->first();
    return $device && ($user->id === $device->user_id ||
            $user->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT));
});
