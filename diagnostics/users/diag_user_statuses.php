<?php

/**
 * ДИАГНОСТИКА СТАТУСОВ ПОЛЬЗОВАТЕЛЕЙ И ПОЛЕЙ EMAIL-ПРОЦЕССА.
 *
 * Запуск: php diagnostics/users/diag_user_statuses.php
 * Контрольный пользователь: php diagnostics/users/diag_user_statuses.php (переменная окружения DIAG_EMAIL)
 *
 * Показывает:
 *   1. Наличие полей email-процесса в User::$fillable
 *   2. Текущее состояние полей у пользователей с активным/завершённым процессом
 *   3. Сводку статусов (verified / unverified / trashed / banned)
 *   4. Расчёт hasVerifiedEmail() и getStatusType() на контрольном пользователе
 */

if (php_sapi_name() !== 'cli') {
    exit('CLI only');
}

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\LoginAttempt;
use App\Models\User;

echo '=== DIAGNOSTICS: USER STATUSES ===' . PHP_EOL . PHP_EOL;

// 1. Fillable модели
$user = new User();
$fillable = $user->getFillable();
echo '1. Fields in User::$fillable:' . PHP_EOL;
foreach ([
             'email_verified_at',
             'pending_new_email',
             'pending_email_token',
             'pending_email_expires_at',
             'old_email_confirmed',
             'old_email_confirm_method',
             'new_email_confirm_method',
         ] as $field) {
    echo '   ' . $field . ': ' . (in_array($field, $fillable, true) ? 'OK' : 'MISSING!!!') . PHP_EOL;
}

// 2. Состояние полей email-процесса
echo PHP_EOL . '2. Users with email-change process fields:' . PHP_EOL;
$users = User::withTrashed()
    ->where(function ($q) {
        $q->whereNotNull('new_email_confirm_method')
            ->orWhereNotNull('old_email_confirm_method')
            ->orWhereNotNull('pending_new_email');
    })
    ->get([
        'id', 'name', 'email', 'deleted_at',
        'email_verified_at', 'old_email_confirmed',
        'old_email_confirm_method', 'new_email_confirm_method',
        'pending_new_email',
    ]);

if ($users->isEmpty()) {
    echo '   no users with active or completed email-change process' . PHP_EOL;
} else {
    foreach ($users as $u) {
        echo '   ID=' . $u->id . ' (' . $u->name . ')' . ($u->trashed() ? ' [TRASHED]' : '') . PHP_EOL;
        echo '     email:                    ' . $u->email . PHP_EOL;
        echo '     email_verified_at:        ' . ($u->email_verified_at ?: 'NULL') . PHP_EOL;
        echo '     old_email_confirmed:      ' . ($u->old_email_confirmed ? 'true' : 'false') . PHP_EOL;
        echo '     old_email_confirm_method: ' . ($u->old_email_confirm_method ?: 'NULL') . PHP_EOL;
        echo '     new_email_confirm_method: ' . ($u->new_email_confirm_method ?: 'NULL') . PHP_EOL;
        echo '     pending_new_email:        ' . ($u->pending_new_email ?: 'NULL') . PHP_EOL;
    }
}

// 3. Сводка статусов
echo PHP_EOL . '3. Status summary:' . PHP_EOL;
echo '   total users:              ' . User::count() . PHP_EOL;
echo '   with email_verified_at:   ' . User::whereNotNull('email_verified_at')->count() . PHP_EOL;
echo '   unverified (not deleted): ' . User::whereNull('email_verified_at')->whereNull('deleted_at')->count() . PHP_EOL;
echo '   trashed:                  ' . User::onlyTrashed()->count() . PHP_EOL;
echo '   banned (LoginAttempt):    ' . LoginAttempt::where('is_banned', true)->count() . PHP_EOL;

// 4. Контрольный пользователь
echo PHP_EOL . '4. Control user:' . PHP_EOL;
$controlEmail = getenv('DIAG_EMAIL') ?: 'dillerasvasviner@gmail.com';
$control = User::withTrashed()->where('email', $controlEmail)->first();
if ($control) {
    $isBanned = LoginAttempt::where('email', $control->email)->where('is_banned', true)->exists();
    $statusType = $control->trashed()
        ? 'trashed'
        : ($isBanned ? 'banned' : (!$control->hasVerifiedEmail() ? 'unverified' : 'active'));
    echo '   email: ' . $control->email . PHP_EOL;
    echo '   hasVerifiedEmail(): ' . ($control->hasVerifiedEmail() ? 'true' : 'false') . PHP_EOL;
    echo '   getStatusType() returns: ' . $statusType . PHP_EOL;
} else {
    echo '   user ' . $controlEmail . ' not found' . PHP_EOL;
}

echo PHP_EOL . '=== END ===' . PHP_EOL;
