<?php

/**
 * Восстанавливает методы подтверждения (old/new_email_confirm_method) из журнала событий.
 * Применялся после ошибочного сброса методов в NULL на финальных шагах смены email.
 *
 * Запуск: php diagnostics/users/restore_confirm_methods.php
 *
 * Используемые заголовки журнала:
 *   Old Email Confirmed       -> old_email_confirm_method = 'email'
 *   Admin Email Old Confirmed -> old_email_confirm_method = 'admin'
 *   Email Changed             -> new_email_confirm_method = 'email'
 *   Admin Email Changed       -> new_email_confirm_method = 'admin'
 *
 * НЕ трогает пользователей с АКТИВНЫМ запросом смены (pending_new_email не null).
 */

if (php_sapi_name() !== 'cli') {
    exit('CLI only');
}

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Log;
use App\Models\User;

$map = [
    'Old Email Confirmed'       => ['old_email_confirm_method' => 'email'],
    'Admin Email Old Confirmed' => ['old_email_confirm_method' => 'admin'],
    'Email Changed'             => ['new_email_confirm_method' => 'email'],
    'Admin Email Changed'       => ['new_email_confirm_method' => 'admin'],
];

foreach ($map as $title => $attrs) {
    $ids = Log::where('title', $title)->pluck('user_id')->unique();
    $count = User::whereIn('id', $ids)
        ->whereNull('pending_new_email')
        ->update($attrs);
    echo $title . ': restored for ' . $count . ' users' . PHP_EOL;
}
