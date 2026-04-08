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
 * ✅ Порядок: Базовые → Интерфейс → Защита → SmartLight
 * ============================================================================
 */

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Глобальный сброс кеша прав перед всеми сидерами
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('🚀 <bg=blue;fg=white> ЗАПУСК СИДЕРОВ </>');
        $this->command->newLine();

        // === 1. БАЗОВЫЕ ДАННЫЕ ===
        $this->call(\Database\Seeders\Base\AdminBaseSeeder::class);

        // === 2. ИНТЕРФЕЙС АДМИНКИ ===
        $this->call(\Database\Seeders\Interface\AdminMenuSeeder::class);
        $this->call(\Database\Seeders\Interface\Template\TemplateSeeder::class);

        // === 3. ЭЛЕКТРИЧЕСКАЯ ЗАЩИТА ===
        $this->call(\Database\Seeders\ElectricalProtection\ElectricalProtectionSeeder::class);

        // === 4. SMARTLIGHT (полный пакет) ===
        $this->call(\Database\Seeders\SmartLight\SmartLightMainSeeder::class);

        $this->command->newLine();
        $this->command->info('✅ <bg=green;fg=black> ВСЕ СИДЕРЫ ЗАВЕРШЕНЫ </>');
    }
}
