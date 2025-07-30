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

    public static function recordAttempt($ip, $success = false)
    {
        $attempt = self::firstOrNew(['ip_address' => $ip]);

        if ($success) {
            $attempt->attempts = 0;
        } else {
            $attempt->attempts++;
            $attempt->last_attempt_at = now();

            if ($attempt->attempts >= 5) {
                $attempt->banned = true;
            }
        }

        $attempt->save();
        return $attempt;
    }
}
