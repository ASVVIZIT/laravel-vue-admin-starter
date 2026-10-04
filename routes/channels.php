<?php

use App\Models\TalkStream\FriendRequest;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| ПРАВИЛО: В channels.php указываем имена БЕЗ префиксов!
| Laravel автоматически добавит 'private-' или 'presence-' при проверке.
|
| echo.private('user.1') → канал 'private-user.1' → правило 'user.{id}'
| echo.join('chat')      → канал 'presence-chat'  → правило 'chat'
|
*/

// ========================================================================
// PRIVATE-КАНАЛЫ (Laravel добавит 'private-' автоматически)
// ========================================================================

// echo.private('user.1') → private-user.1
Broadcast::channel('user.{id}', function (User $user, int $id) {
    return (int) $user->id === (int) $id;
});

// Системный канал модели
Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
    return (int) $user->id === (int) $id;
});

// ========================================================================
// PRESENCE-КАНАЛЫ (Laravel добавит 'presence-' автоматически)
// ========================================================================

// echo.join('chat') → presence-chat
Broadcast::channel('chat', function (User $user) {
    return [
        'id'   => (int) $user->id,
        'name' => $user->name ?? 'User',
    ];
});

// ========================================================================
// КАНАЛЫ ЧАТА
// ========================================================================

// echo.private('chat.1') → private-chat.1
Broadcast::channel('chat.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('chat.read.{from_id}', function (User $user, int $from_id) {
    return (int) $user->id === (int) $from_id;
});

// ========================================================================
// КАНАЛЫ ЗАЯВОК В ДРУЗЬЯ
// ========================================================================

// echo.private('friends.1') → private-friends.1
Broadcast::channel('friends.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId;
});

// ========================================================================
// КАНАЛЫ ЗВОНКОВ / WebRTC
// ========================================================================

// echo.private('call.1') → private-call.1
Broadcast::channel('call.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId;
});

// echo.private('signal.1') → private-signal.1
Broadcast::channel('signal.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId;
});

// ========================================================================
// SMART LIGHT
// ========================================================================

Broadcast::channel('smart-light.device.{deviceId}', function (User $user, string $deviceId) {
    $device = \App\Models\SmartLight\SmartLightDevice::where('device_id', $deviceId)->first();

    return $device && (
            (int) $user->id === (int) $device->user_id
            || $user->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)
        );
});

// ========================================================================
// ТЕСТОВЫЙ
// ========================================================================

Broadcast::channel('test-channel', function (User $user) {
    return true;
});
