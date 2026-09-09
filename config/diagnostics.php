<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Diagnostics — админ-панель разработчика
    |--------------------------------------------------------------------------
    | enabled=false полностью отключает раздел: роуты не регистрируются,
    | API отвечает 404. Реестр entities — источник истины для вкладок UI.
    |
    */

    'enabled' => env('DIAGNOSTICS_ENABLED', true),

    // TTL писем в ящике симуляции (сек), используется с B4
    'outbox_ttl' => (int) env('DIAGNOSTICS_OUTBOX_TTL', 86400),

    // Домены, разрешённые для симуляций и тест-записей
    'whitelist_domains' => ['fenix.dev'],

    // Префикс имен тестовых записей CRUD-сюита
    'test_prefix' => 'DIAG-',

    // Реестр сущностей: ключ = папка в diagnostics/ и entities/ во фронте
    'entities' => [
        'users' => [
            'provider' => \App\Services\Diagnostics\Entities\UsersProvider::class,
            'cli' => 'diagnostics/users',
            // сидер тест-юзеров появится в B3, использование через class_exists
            'seeder' => \Database\Seeders\Diagnostics\DiagnosticPermissionsSeeder::class,
        ],
    ],

];
