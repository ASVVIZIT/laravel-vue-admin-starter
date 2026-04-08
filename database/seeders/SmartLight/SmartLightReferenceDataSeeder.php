<?php

namespace Database\Seeders\SmartLight;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * ============================================================================
 * SMARTLIGHT — СПРАВОЧНИКИ ТИПОВ (Батареи, Лампы, Питание)
 * ============================================================================
 * 📁 Путь: database/seeders/SmartLight/SmartLightReferenceDataSeeder.php
 * ✅ Константы: Используются в фабриках и других сидерах
 * ✅ Upsert: Безопасное обновление/вставка без дубликатов
 * ✅ Статистика: Считаем реальные записи в БД после вставки
 * ============================================================================
 */

class SmartLightReferenceDataSeeder extends Seeder
{
    // ✅ КОНСТАНТЫ ДЛЯ ПЕРЕИСПОЛЬЗОВАНИЯ (в фабриках/сидерах)
    public const BATTERY_TYPES = [
        'li-ion-10440', 'li-ion-14500', 'li-ion-14650', 'li-ion-16340',
        'li-ion-18350', 'li-ion-18650', 'li-ion-21700', 'li-ion-26650',
        'alkaline-aa', 'alkaline-aaa', 'nimh-aa', 'nimh-aaa',
        'li-po', 'li-fe-po4-32650', 'lead-acid-12v'
    ];

    public const BULB_TYPES = [
        'classic', 'led', 'smart-rgb', 'halogen', 'cfl', 'led-strip', 'tube'
    ];

    public const POWER_SUPPLY_TYPES = [
        'standard', 'ac-220v', 'dc-12v', 'dc-24v', 'solar',
        'usb-5v', 'battery-pack', 'generator', 'ups', 'dc-switch'
    ];

    public function run(): void
    {
        // 1. Вставляем данные
        $this->seedBatteryTypes();
        $this->seedBulbTypes();
        $this->seedPowerSupplies();

        // 2. Считаем РЕАЛЬНОЕ количество записей в БД
        $batteryCount = DB::table('smart_light_battery_types')->count();
        $bulbCount = DB::table('smart_light_bulb_types')->count();
        $powerCount = DB::table('smart_light_power_supplies')->count();

        // 3. Выводим статистику с фактическими цифрами
        $this->command->info("   🔋 Батареи: <fg=green>{$batteryCount}</> типов");
        $this->command->info("   💡 Лампы:     <fg=green>{$bulbCount}</> типов");
        $this->command->info("   ⚡ Питание:   <fg=green>{$powerCount}</> типов");
        $this->command->info('✅ Reference data seeded');
    }

    private function seedBatteryTypes(): void
    {
        $types = [
            ['id' => 'li-ion-10440', 'name' => 'Li-Ion 10440 (AAA-формат)', 'short_name' => '10440', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 350],
            ['id' => 'li-ion-14500', 'name' => 'Li-Ion 14500 (AA-формат, короткий)', 'short_name' => '14500', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 900],
            ['id' => 'li-ion-14650', 'name' => 'Li-Ion 14650 (AA-формат)', 'short_name' => '14650', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 800],
            ['id' => 'li-ion-16340', 'name' => 'Li-Ion 16340 (RCR123A)', 'short_name' => '16340', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 880],
            ['id' => 'li-ion-18350', 'name' => 'Li-Ion 18350 (короткий)', 'short_name' => '18350', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 1200],
            ['id' => 'li-ion-18650', 'name' => 'Li-Ion 18650', 'short_name' => '18650', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 3500],
            ['id' => 'li-ion-21700', 'name' => 'Li-Ion 21700', 'short_name' => '21700', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 5000],
            ['id' => 'li-ion-26650', 'name' => 'Li-Ion 26650', 'short_name' => '26650', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 5500],
            ['id' => 'alkaline-aa', 'name' => 'Алкалиновая AA', 'short_name' => 'Alkaline AA', 'chemistry' => 'alkaline', 'min_voltage' => 0.9, 'max_voltage' => 1.6, 'critical_voltage' => 1.0, 'nominal_capacity' => 2800],
            ['id' => 'alkaline-aaa', 'name' => 'Алкалиновая AAA', 'short_name' => 'Alkaline AAA', 'chemistry' => 'alkaline', 'min_voltage' => 0.9, 'max_voltage' => 1.6, 'critical_voltage' => 1.0, 'nominal_capacity' => 1200],
            ['id' => 'nimh-aa', 'name' => 'Ni-MH AA', 'short_name' => 'NiMH AA', 'chemistry' => 'ni-mh', 'min_voltage' => 1.0, 'max_voltage' => 1.5, 'critical_voltage' => 1.0, 'nominal_capacity' => 2500],
            ['id' => 'nimh-aaa', 'name' => 'Ni-MH AAA', 'short_name' => 'NiMH AAA', 'chemistry' => 'ni-mh', 'min_voltage' => 1.0, 'max_voltage' => 1.5, 'critical_voltage' => 1.0, 'nominal_capacity' => 1100],
            ['id' => 'li-po', 'name' => 'Li-Po', 'short_name' => 'Li-Po', 'chemistry' => 'lithium-polymer', 'min_voltage' => 3.0, 'max_voltage' => 4.2, 'critical_voltage' => 3.2, 'nominal_capacity' => 2200],
            ['id' => 'li-fe-po4-32650', 'name' => 'LiFePO4 32650', 'short_name' => 'LiFePO4', 'chemistry' => 'lithium-iron-phosphate', 'min_voltage' => 2.0, 'max_voltage' => 3.65, 'critical_voltage' => 2.5, 'nominal_capacity' => 6000],
            ['id' => 'lead-acid-12v', 'name' => 'Свинцово-кислотная 12В', 'short_name' => 'Pb-12V', 'chemistry' => 'lead-acid', 'min_voltage' => 10.5, 'max_voltage' => 14.4, 'critical_voltage' => 11.0, 'nominal_capacity' => 7000],
        ];

        DB::table('smart_light_battery_types')->upsert(
            $types,
            ['id'],
            ['name', 'short_name', 'chemistry', 'min_voltage', 'max_voltage', 'critical_voltage', 'nominal_capacity', 'updated_at']
        );
    }

    private function seedBulbTypes(): void
    {
        $types = [
            ['id' => 'classic', 'name' => 'Классическая', 'short_name' => 'Classic', 'category' => 'incandescent', 'light_efficiency' => 10, 'color_temperature' => 2700, 'lifespan' => 1000],
            ['id' => 'led', 'name' => 'LED', 'short_name' => 'LED', 'category' => 'led', 'light_efficiency' => 80, 'color_temperature' => 4000, 'lifespan' => 25000],
            ['id' => 'smart-rgb', 'name' => 'Smart RGB', 'short_name' => 'RGB', 'category' => 'smart', 'light_efficiency' => 60, 'color_temperature' => 6500, 'lifespan' => 15000],
            ['id' => 'halogen', 'name' => 'Галогенная', 'short_name' => 'Halogen', 'category' => 'halogen', 'light_efficiency' => 15, 'color_temperature' => 3000, 'lifespan' => 2000],
            ['id' => 'cfl', 'name' => 'Люминесцентная', 'short_name' => 'CFL', 'category' => 'fluorescent', 'light_efficiency' => 50, 'color_temperature' => 4000, 'lifespan' => 8000],
            ['id' => 'led-strip', 'name' => 'LED лента', 'short_name' => 'Strip', 'category' => 'led-strip', 'light_efficiency' => 90, 'color_temperature' => 4000, 'lifespan' => 30000],
            ['id' => 'tube', 'name' => 'Трубчатая', 'short_name' => 'Tube', 'category' => 'fluorescent', 'light_efficiency' => 60, 'color_temperature' => 4000, 'lifespan' => 10000],
        ];

        DB::table('smart_light_bulb_types')->upsert(
            $types,
            ['id'],
            ['name', 'short_name', 'category', 'light_efficiency', 'color_temperature', 'lifespan', 'updated_at']
        );
    }

    private function seedPowerSupplies(): void
    {
        $types = [
            ['id' => 'standard', 'name' => 'Стандартный источник', 'short_name' => 'Standard', 'category' => 'standard', 'voltage_range' => json_encode(['min' => 2.5, 'max' => 4.3]), 'current_range' => json_encode(['min' => 0, 'max' => 1000])],
            ['id' => 'ac-220v', 'name' => 'AC 220V', 'short_name' => 'AC 220V', 'category' => 'ac', 'voltage_range' => json_encode(['min' => 220, 'max' => 240]), 'current_range' => json_encode(['min' => 0, 'max' => 2000])],
            ['id' => 'dc-12v', 'name' => 'DC 12V', 'short_name' => 'DC 12V', 'category' => 'dc', 'voltage_range' => json_encode(['min' => 11, 'max' => 13]), 'current_range' => json_encode(['min' => 0, 'max' => 2000])],
            ['id' => 'dc-24v', 'name' => 'DC 24V', 'short_name' => 'DC 24V', 'category' => 'dc', 'voltage_range' => json_encode(['min' => 22, 'max' => 26]), 'current_range' => json_encode(['min' => 0, 'max' => 2000])],
            ['id' => 'solar', 'name' => 'Солнечная панель', 'short_name' => 'Solar', 'category' => 'renewable', 'voltage_range' => json_encode(['min' => 2.5, 'max' => 6.0]), 'current_range' => json_encode(['min' => 0, 'max' => 500])],
            ['id' => 'usb-5v', 'name' => 'USB 5V', 'short_name' => 'USB', 'category' => 'usb', 'voltage_range' => json_encode(['min' => 4.5, 'max' => 5.5]), 'current_range' => json_encode(['min' => 0, 'max' => 2000])],
            ['id' => 'battery-pack', 'name' => 'Батарейный отсек', 'short_name' => 'Pack', 'category' => 'battery', 'voltage_range' => json_encode(['min' => 3.0, 'max' => 12.0]), 'current_range' => json_encode(['min' => 0, 'max' => 1000])],
            ['id' => 'generator', 'name' => 'Бензогенератор', 'short_name' => 'Gen', 'category' => 'generator', 'voltage_range' => json_encode(['min' => 220, 'max' => 240]), 'current_range' => json_encode(['min' => 0, 'max' => 5000])],
            ['id' => 'ups', 'name' => 'ИБП', 'short_name' => 'UPS', 'category' => 'ups', 'voltage_range' => json_encode(['min' => 220, 'max' => 240]), 'current_range' => json_encode(['min' => 0, 'max' => 3000])],
            ['id' => 'dc-switch', 'name' => 'Регулируемый БП', 'short_name' => 'DC Sw', 'category' => 'dc-adjustable', 'voltage_range' => json_encode(['min' => 3.0, 'max' => 24.0]), 'current_range' => json_encode(['min' => 0, 'max' => 2000])],
        ];

        DB::table('smart_light_power_supplies')->upsert(
            $types,
            ['id'],
            ['name', 'short_name', 'category', 'voltage_range', 'current_range', 'updated_at']
        );
    }
}
