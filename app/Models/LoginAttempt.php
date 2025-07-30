<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginAttempt extends Model
{
    protected $fillable = [
        'ip_address',
        'attempts',
        'last_attempt_at',
        'banned'
    ];

    public static function recordAttempt($ip)
    {
        $attempt = self::firstOrCreate(['ip_address' => $ip]);
        $attempt->attempts++;
        $attempt->last_attempt_at = now();

        // Блокировка после 5 неудачных попыток
        if ($attempt->attempts >= 5) {
            $attempt->banned = true;
        }

        $attempt->save();
        return $attempt;
    }
}
