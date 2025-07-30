<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\LoginAttempt;
use Illuminate\Support\Facades\Auth;

class CheckIpBanned
{
    public function handle($request, Closure $next)
    {
        $ip = $request->ip();
        $attempt = LoginAttempt::firstOrCreate(['ip_address' => $ip]);

        if ($attempt->banned) {
            return response()->json(['error' => 'IP заблокирован'], 403);
        }

        // Запись неудачной попытки при ошибке аутентификации
        if ($request->is('auth/login') && !Auth::attempt($request->only('email', 'password'))) {
            LoginAttempt::recordAttempt($ip);
        }

        return $next($request);
    }
}
