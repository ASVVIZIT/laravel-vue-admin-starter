<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsTestingEnvironment
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Проверяем, что приложение находится в тестовой среде
        if (!app()->environment(['local', 'testing'])) {
            return response()->json(['error' => 'Эта функция доступна только в тестовой среде.'], 403);
        }

        return $next($request);
    }
}
