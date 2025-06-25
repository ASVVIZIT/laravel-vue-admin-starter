<?php

return [
    'default' => env('REVERB_SERVER', 'reverb'),

    'servers' => [
        'websockets' => [
            'logger' => [
                'channel' => 'single',
                'level' => 'debug',
            ],
        ],
        'reverb' => [
            'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
            'port' => env('REVERB_SERVER_PORT', 8080), // Используем порт
            'path' => env('REVERB_SERVER_PATH', '/reverb'), // Добавляем путь /reverb
            'hostname' => env('REVERB_HOST', '94.41.87.10'), // Ваш внешний IP
            'allowed_origins' => ['*'],
            'options' => [
                'tls' => [],
                'transport' => 'tcp',
                'path' => '/reverb',
                'allowed_origins' => ['*']
            ],
            'max_request_size' => env('REVERB_MAX_REQUEST_SIZE', 10_000),
            'scaling' => [
                'enabled' => env('REVERB_SCALING_ENABLED', false),
                'channel' => env('REVERB_SCALING_CHANNEL', 'ws'),
                'server' => [
                    'url' => env('REDIS_URL'),
                    'host' => env('REDIS_HOST', '127.0.0.1'),
                    'port' => env('REDIS_PORT', '6379'),
                    'username' => env('REDIS_USERNAME'),
                    'password' => env('REDIS_PASSWORD'),
                    'database' => env('REDIS_DB', '0'),
                    'timeout' => env('REDIS_TIMEOUT', 60),
                ],
            ],
            'pulse_ingest_interval' => env('REVERB_PULSE_INGEST_INTERVAL', 15),
            'telescope_ingest_interval' => env('REVERB_TELESCOPE_INGEST_INTERVAL', 15),
        ],
    ],

    'apps' => [
        'provider' => 'config',

        'apps' => [
            [
                'id' => env('REVERB_APP_ID', 'talkstream_app'),
                'key' => env('REVERB_APP_KEY'),
                'secret' => env('REVERB_APP_SECRET'),
                'app_id' => env('REVERB_APP_ID', 'talkstream_app'),
                'options' => [
                    'host' => env('REVERB_HOST', '94.41.87.10'), // Ваш внешний IP
                    'port' => env('REVERB_PORT', 8080),
                    'scheme' => env('REVERB_SCHEME', 'http'), // HTTP схема
                    'useTLS' => false, // Явно отключаем TLS
                ],
                'allowed_origins' => ['*'], // Разрешаем все источники
                'ping_interval' => env('REVERB_APP_PING_INTERVAL', 60),
                'activity_timeout' => env('REVERB_APP_ACTIVITY_TIMEOUT', 30),
                'max_message_size' => env('REVERB_APP_MAX_MESSAGE_SIZE', 10_000),
            ],
        ],
    ],
];
