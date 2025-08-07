<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginAttempt extends Model
{
    protected $fillable = [
        'ip_address',
        'email',
        'user_agent',
        'is_banned',
        'attempts',
        'last_attempt_at'
    ];

    protected $casts = [
        'is_banned' => 'boolean',
        'last_attempt_at' => 'datetime'
    ];

    // Запись попытки входа
    public static function recordAttempt($ip, $email, $userAgent, $success = false)
    {
        $attempt = self::firstOrNew(['ip_address' => $ip]);

        if ($success) {
            // Сброс счетчика при успешном входе
            $attempt->attempts = 0;
            $attempt->is_banned = false;
        } else {
            // Увеличение счетчика при неудаче
            $attempt->attempts++;
            $attempt->last_attempt_at = now();
            $attempt->email = $email;
            $attempt->user_agent = $userAgent;

            // Автоблокировка после 5 попыток
            if ($attempt->attempts >= 5) {
                $attempt->is_banned = true;
            }
        }

        $attempt->save();
        return $attempt;
    }
}
