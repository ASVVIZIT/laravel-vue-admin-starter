<?php

return [
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

    // ✅ ИСПРАВЛЕНО: ДОБАВЛЕНЫ ВСЕ ПОРТЫ И IP
    'allowed_origins' => [
        // Внешний IP (все порты)
        'http://94.41.87.10',
        'http://94.41.87.10:80',
        'http://94.41.87.10:3000',
        'http://94.41.87.10:5173',
        'http://94.41.87.10:8050',
        'http://94.41.87.10:8080',

        // Локальный IP (все порты)
        'http://192.168.88.249',
        'http://192.168.88.249:80',
        'http://192.168.88.249:3000',
        'http://192.168.88.249:5173',
        'http://192.168.88.249:8050',
        'http://192.168.88.249:8080',

        // Localhost (все порты)
        'http://localhost',
        'http://localhost:80',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8050',
        'http://localhost:8080',

        // 127.0.0.1 (все порты)
        'http://127.0.0.1',
        'http://127.0.0.1:80',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8050',
        'http://127.0.0.1:8080',

        // Домен
        'http://fenixlaravel.loc',
        'http://fenixlaravel.loc:80',
        'http://fenixlaravel.loc:3000',
        'http://fenixlaravel.loc:5173',
        'http://fenixlaravel.loc:8050',
        'http://fenixlaravel.loc:8080',
    ],

    'allowed_methods' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'credentials' => true,
    'supports_credentials' => true,
];
