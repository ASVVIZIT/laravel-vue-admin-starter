<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        // ✅ Для API запросов — не редиректим (вернём 401)
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }

        // ✅ Для web запросов — редирект на админский login (SPA маршрут)
        return '/admin/#/login';
    }
}
