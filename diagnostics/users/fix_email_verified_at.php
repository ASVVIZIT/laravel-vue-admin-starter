<?php

/**
 * РАЗОВАЯ ПРАВКА: проставляет email_verified_at пользователям, у которых смена email
 * завершилась, но верификация не записалась (исторический баг: поле отсутствовало в $fillable).
 *
 * Запуск: php diagnostics/users/fix_email_verified_at.php
 *
 * НЕ трогает методы подтверждения (old/new_email_confirm_method) — это персистентная история.
 * НЕ трогает пользователей с АКТИВНЫМ запросом смены (pending_new_email не null).
 * НЕ трогает soft-deleted пользователей.
 */

if (php_sapi_name() !== 'cli') {
    exit('CLI only');
}

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$count = User::whereNotNull('new_email_confirm_method')   // процесс был завершён
->whereNull('pending_new_email')                      // нет активного запроса
->whereNull('email_verified_at')                      // верификация не записана
->whereNull('deleted_at')                             // не удалён
->update(['email_verified_at' => now()]);

echo 'email_verified_at set for ' . $count . ' users' . PHP_EOL;
