<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*',
        'login',
        'admin/login',
        'api/login',
        'api/admin/login',
        'logout',
        'admin/logout',
        'api/logout',
        'api/admin/logout',
        'sanctum/*',
        'sanctum/csrf-cookie',
        'api/sanctum/csrf-cookie',
        'broadcasting/*',
        'broadcasting/auth',
        'api/broadcasting/auth',
        'reverb/*',
        'ws/*'
    ],

    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://94.41.87.10',
        'http://94.41.87.10:8050',
        'http://94.41.87.10:8080',
        'http://localhost:5173',
        'http://127.0.0.1:8050',
        'http://127.0.0.1:8080',
    ],
    /*'allowed_origins' => [
        'http://94.41.87.10',
        'http://94.41.87.10:8050',
        'http://94.41.87.10:8070',
        'http://94.41.87.10:8080',
        'http://fenixlaravel.loc:8050',
        'http://fenixlaravel.loc:8080',
        'http://fenixlaravel.loc',
        'http://localhost:5173',
        'http://127.0.0.1:8050',
        'http://127.0.0.1:8080',
        'http://127.0.0.1',
    ],*/
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    /*'allowed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
    ],*/
    'max_age' => 0,
    'credentials' => true,
    'supports_credentials' => true,

];
