<?php

namespace Database\Seeders\SmartLight;

use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

/**
 * ============================================================================
 * SMARTLIGHT — ГЛАВНЫЙ СИДЕР-ОРКЕСТРАТОР
 * ============================================================================
 * 📁 Путь: database/seeders/SmartLight/SmartLightMainSeeder.php
 * ✅ Запуск: Через DatabaseSeeder или напрямую
 * ✅ Порядок: Права → Справочники → Настройки → Устройства → Телеметрия
 * ============================================================================
 */

class SmartLightMainSeeder extends Seeder
{
    public function run(): void
    {
        // Сброс кеша прав для SmartLight
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('🔦 <bg=cyan;fg=black> SMARTLIGHT: Старт сидеров </>');

        $this->call([
            // 1. Права доступа (должны быть первыми)
            SmartLightPermissionsSeeder::class,

            // 2. Справочники типов (батареи, лампы, питание)
            SmartLightReferenceDataSeeder::class,

            // 3. Глобальные настройки
            SmartLightSettingsSeeder::class,

            // 4. Устройства (демо + фабрика)
            SmartLightDeviceSeeder::class,

            // 5. Телеметрия для устройств
            SmartLightTelemetrySeeder::class,
        ]);

        $this->command->info('✅ <fg=green> SmartLight: Все сидеры завершены! </>');
        $this->command->newLine();
    }
}
