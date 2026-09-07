<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

/**
 * ============================================================================
 * ГЛАВНЫЙ СИДЕР БАЗЫ ДАННЫХ
 * ============================================================================
 * 📁 Путь: database/seeders/DatabaseSeeder.php
 * ✅ Запуск: php artisan migrate:fresh --seed
 * ============================================================================
 */

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('🚀 <bg=blue;fg=white> ЗАПУСК СИДЕРОВ </>');
        $this->command->newLine();

        $this->call([
            \Database\Seeders\Base\AdminBaseSeeder::class,
            \Database\Seeders\ElectricalProtection\ElectricalProtectionSeeder::class,
            \Database\Seeders\SmartLight\SmartLightMainSeeder::class,
            \Database\Seeders\Training\TrainingModuleSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('✅ <bg=green;fg=black> ВСЕ СИДЕРЫ ЗАВЕРШЕНЫ </>');
    }
}
