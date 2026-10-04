<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('private-user.{id}', function (User $user, int $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('presence-chat', function (User $user) {
    return [
        'id' => (int) $user->id,
        'name' => $user->name ?? 'User',
    ];
});

// Временный тестовый канал, который разрешает всё
Broadcast::channel('test-channel', function (User $user) {
    return true;
});
