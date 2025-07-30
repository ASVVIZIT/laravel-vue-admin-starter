<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\Models\LoginAttempt;

class CheckIpBanned
{
    public function handle($request, Closure $next)
    {
        $ip = $request->ip();
        $attempt = LoginAttempt::firstOrCreate(['ip_address' => $ip]);

        if ($attempt->banned) {
            return response()->json(['error' => 'Ваш IP заблокирован'], 403);
        }

        $response = $next($request);

        // Записываем попытку после обработки запроса
        if ($request->routeIs('login')) {
            $success = Auth::check();
            LoginAttempt::recordAttempt($ip, $success);
        }

        return $response;
    }
}
