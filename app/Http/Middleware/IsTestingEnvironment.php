<?php

namespace App\Http\Middleware;

use Closure;

class IsTestingEnvironment
{
    public function handle($request, Closure $next)
    {
        if (app()->environment('production')) {
            abort(404, 'Тестовый режим недоступен в production');
        }
        return $next($request);
    }
}
