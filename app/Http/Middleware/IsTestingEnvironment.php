<?php

namespace App\Http\Middleware;

use Closure;

class IsTestingEnvironment
{
    public function handle($request, Closure $next)
    {
        if (app()->environment('production')) {
            return response()->json([
                'error' => 'Тестовый режим недоступен в production'
            ], 403);
        }
        return $next($request);
    }
}
