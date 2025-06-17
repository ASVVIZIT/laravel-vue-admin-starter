<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*',
        'broadcasting/auth',
        'api/broadcasting/auth',
        'broadcasting/authenticate',
        'api/broadcasting/authenticate',
        'sanctum/csrf-cookie',
        'api/sanctum/csrf-cookie',
        'login',
        'logout'
    ];
}
