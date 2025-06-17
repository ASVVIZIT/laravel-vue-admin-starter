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
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'broadcasting/auth',
        'api/broadcasting/auth',
        'reverb/*',
        'ws/*'
    ],

    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://94.41.87.10',
        'http://94.41.87.10:8070',
        'http://94.41.87.10:8050',
        'http://192.168.88.249',
        'http://fenixlaravel.loc',
        'http://localhost:5173',
        'http://localhost:80',
        'http://localhost',
        'http://127.0.0.1:8080',
        'http://127.0.0.1',
    ],
    'allowed_origins_patterns' => [],
    /*'allowed_headers' => ['*'],*/
    'allowed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-Socket-ID',
        'X-CSRF-TOKEN',
    ],
    'max_age' => 0,
    'supports_credentials' => true,

];
