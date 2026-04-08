<?php

namespace Database\Factories\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Database\Seeders\SmartLight\SmartLightReferenceDataSeeder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use function now;

/**
 * ============================================================================
 * SMARTLIGHT — ФАБРИКА УСТРОЙСТВ
 * ============================================================================
 * 📁 Путь: database/factories/SmartLight/SmartLightDeviceFactory.php
 * ✅ Типы: Берутся из констант ReferenceDataSeeder (гарантия валидности)
 * ✅ Реал/Фейк: 30% реальных (is_fake=false), 70% тестовых
 * ✅ Статусы: Он, Выкл, Сон — с адекватным напряжением
 * ============================================================================
 */

class SmartLightDeviceFactory extends Factory
{
    protected $model = SmartLightDevice::class;

    public function definition(): array
    {
        // 30% "реальных" устройств (для тестов интерфейса без флага is_fake)
        $isFake = $this->faker->boolean(70);
        $status = $this->faker->randomElement(['ON', 'OFF', 'SLEEPING']);

        // Напряжение зависит от статуса (реалистичные диапазоны)
        $voltage = match ($status) {
            'ON'       => $this->faker->randomFloat(1, 3.5, 4.2),
            'SLEEPING' => $this->faker->randomFloat(1, 3.0, 3.7),
            'OFF'      => $this->faker->randomFloat(1, 2.5, 3.5),
            default    => 3.7,
        };

        // ✅ Типы устройств берем из БД (через константы сидера)
        $batteryTypes = SmartLightReferenceDataSeeder::BATTERY_TYPES;
        $bulbTypes = SmartLightReferenceDataSeeder::BULB_TYPES;
        $powerSupplies = SmartLightReferenceDataSeeder::POWER_SUPPLY_TYPES;

        return [
            // Базовые поля
            'user_id'      => $isFake ? null : \App\Models\User::factory(),
            'name'         => $isFake
                ? 'Демо: ' . $this->faker->words(2, true)
                : 'РеалФейк: ' . $this->faker->words(2, true),
            'device_id'    => $isFake
                ? 'fake_device_' . Str::random(8)
                : 'real_device_' . Str::random(8),
            'device_type'  => $this->faker->randomElement(['node_mcu_v3', 'esp32', 'esp8266']),

            // ✅ Справочники (только валидные ID из БД)
            'battery_type_id'  => $this->faker->randomElement($batteryTypes),
            'bulb_type_id'     => $this->faker->randomElement($bulbTypes),
            'power_supply_id'  => $this->faker->randomElement($powerSupplies),

            // Настройки батареи
            'battery_capacity'           => $this->faker->numberBetween(350, 50000),
            'critical_voltage'           => $this->faker->randomFloat(1, 2.5, 3.5),
            'sleep_interval'             => $this->faker->numberBetween(300, 3600),
            'emergency_sleep_interval'   => $this->faker->numberBetween(600, 7200),

            // Состояние
            'status'    => $status,
            'voltage'   => round($voltage, 2),
            'intensity' => $status === 'ON' ? $this->faker->numberBetween(10, 100) : 0,

            // Системные
            'api_key'                 => Str::random(32),
            'settings'                => json_encode(['test_mode' => true, 'created_by_factory' => true]),
            'is_fake'                 => $isFake,
            'settings_updated_at'     => now(),
            'battery_group_config'    => null,
        ];
    }

    // === СОСТОЯНИЯ (STATES) для гибкой генерации ===

    public function on(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'    => 'ON',
            'voltage'   => $this->faker->randomFloat(1, 3.5, 4.2),
            'intensity' => $this->faker->numberBetween(50, 100),
        ]);
    }

    public function off(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'    => 'OFF',
            'voltage'   => $this->faker->randomFloat(1, 2.5, 3.5),
            'intensity' => 0,
        ]);
    }

    public function lowBattery(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'    => 'SLEEPING',
            'voltage'   => $this->faker->randomFloat(2, 2.5, 3.0),
            'intensity' => 0,
        ]);
    }

    public function error(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'    => 'ERROR',
            'voltage'   => $this->faker->randomFloat(2, 2.0, 2.5),
            'intensity' => 0,
        ]);
    }
}
