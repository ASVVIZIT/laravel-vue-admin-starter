<?php

namespace Database\Seeders\SmartLight;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * ============================================================================
 * SMARTLIGHT — ГЛОБАЛЬНЫЕ НАСТРОЙКИ
 * ============================================================================
 * 📁 Путь: database/seeders/SmartLight/SmartLightSettingsSeeder.php
 * ✅ UpdateOrInsert: Безопасное обновление без дубликатов
 * ✅ Конфиг: Использует config('app.url') для сервера
 * ============================================================================
 */

class SmartLightSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'global_server_url', 'value' => config('app.url') . '/smart-light'],
            ['key' => 'default_critical_voltage', 'value' => '3.2'],
            ['key' => 'default_sleep_interval', 'value' => '600'],
            ['key' => 'default_emergency_sleep_interval', 'value' => '3600'],
            ['key' => 'default_wifi_ssid', 'value' => ''],
            ['key' => 'default_wifi_password', 'value' => ''],
            ['key' => 'timezone', 'value' => 'Europe/Moscow'],
            ['key' => 'log_level', 'value' => 'info'],
            ['key' => 'telemetry_retention_days', 'value' => '30'],
            ['key' => 'voltage_warning_threshold', 'value' => '0.15'],
            ['key' => 'voltage_critical_threshold', 'value' => '0.10'],
            ['key' => 'default_battery_type', 'value' => 'li-ion-18650'],
            ['key' => 'default_bulb_type', 'value' => 'classic'],
            ['key' => 'default_power_supply', 'value' => 'standard'],
            ['key' => 'power_management_mode', 'value' => 'balanced'],
            ['key' => 'controller_runtime', 'value' => '86400'],
            ['key' => 'min_controller_voltage', 'value' => '2.8'],
        ];

        foreach ($settings as $setting) {
            DB::table('smart_light_settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'updated_at' => now(),
                ] + (!DB::table('smart_light_settings')->where('key', $setting['key'])->exists()
                    ? ['created_at' => now()]
                    : [])
            );
        }

        $this->command->info('   ⚙️ Настройки: <fg=green>' . count($settings) . '</> записей');
        $this->command->info('✅ Global settings seeded');
    }
}
