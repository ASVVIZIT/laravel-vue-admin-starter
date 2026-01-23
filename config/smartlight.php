<?php

return [
    'defaults' => [
        'critical_voltage' => 3.2,
        'sleep_interval' => 600,
        'emergency_sleep_interval' => 3600,
        'battery_capacity' => 2000,
        'device_type' => 'node_mcu_v3',
        'power_config' => [
            'shared_power_source' => true,
            'controller_runtime' => 86400, // 24 часа в секундах
            'min_controller_voltage' => 2.8,
            'power_management_mode' => 'conservative'
        ]
    ],

    'telemetry' => [
        'retention_days' => 30,
        'batch_size' => 100
    ],

    'commands' => [
        'timeout' => 120, // seconds
        'types' => [
            'force_sleep' => 'EMERGENCY_SLEEP',
            'wake_up' => 'WAKE_UP',
            'status_update' => 'STATUS_UPDATE'
        ]
    ],

    'logging' => [
        'channel' => 'smartlight',
        'level' => env('SMARTLIGHT_LOG_LEVEL', 'debug')
    ],

    'api' => [
        'version' => 'v1',
        'rate_limit' => [
            'max_attempts' => 5,
            'decay_minutes' => 1
        ]
    ],

    'power_management' => [
        'modes' => [
            'conservative' => [
                'controller_sleep_interval' => 300, // 5 минут
                'deep_sleep_voltage_threshold' => 3.1,
                'wake_up_interval' => 3600 // 1 час
            ],
            'aggressive' => [
                'controller_sleep_interval' => 60, // 1 минута
                'deep_sleep_voltage_threshold' => 3.0,
                'wake_up_interval' => 7200 // 2 часа
            ],
            'balanced' => [
                'controller_sleep_interval' => 180, // 3 минуты
                'deep_sleep_voltage_threshold' => 3.15,
                'wake_up_interval' => 5400 // 1.5 часа
            ]
        ]
    ]
];
