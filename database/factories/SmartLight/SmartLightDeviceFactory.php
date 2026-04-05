<?php

namespace Database\Factories\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use function now;

class SmartLightDeviceFactory extends Factory
{
    protected $model = SmartLightDevice::class;


    public function definition(): array
    {
        $isFake = $this->faker->boolean(70);
        $status = $this->faker->randomElement(['ON', 'OFF', 'SLEEPING']);

        $voltage = match($status) {
            'ON' => $this->faker->randomFloat(1, 3.5, 4.2),
            'SLEEPING' => $this->faker->randomFloat(1, 3.0, 3.7),
            'OFF' => $this->faker->randomFloat(1, 2.5, 3.5),
            default => 3.7,
        };

        return [
            'user_id' => $isFake ? null : \App\Models\User::factory(),
            'name' => $this->faker->words(3, true),
            'device_id' => $isFake ? 'fake_device_' . Str::random(8) : 'real_device_' . Str::random(8),
            'device_type' => $this->faker->randomElement(['node_mcu_v3', 'esp32', 'esp8266']),

            // ✅ Строковые ID из справочников
            'battery_type_id' => $this->faker->randomElement(['li-ion-18650', 'li-ion-21700', 'li-po']),
            'bulb_type_id' => $this->faker->randomElement(['classic', 'led', 'halogen']),
            'power_supply_id' => $this->faker->randomElement(['standard', 'solar', 'grid']),

            'battery_capacity' => $this->faker->numberBetween(1500, 5000),
            'critical_voltage' => $this->faker->randomFloat(1, 2.5, 3.5),
            'sleep_interval' => $this->faker->numberBetween(300, 3600),
            'emergency_sleep_interval' => $this->faker->numberBetween(600, 7200),
            'status' => $status,
            'voltage' => round($voltage, 2),
            'intensity' => $status === 'ON' ? $this->faker->numberBetween(10, 100) : 0,
            'api_key' => Str::random(32),
            'settings' => json_encode(['test_mode' => true, 'created_by_factory' => true]),
            'is_fake' => $isFake,
            'settings_updated_at' => now(),
            'battery_group_config' => null,
        ];
    }

    /**
     * Состояние: устройство включено
     */
    public function on(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'ON',
            'voltage' => $this->faker->randomFloat(1, 3.5, 4.2),
            'intensity' => $this->faker->numberBetween(50, 100),
        ]);
    }

    /**
     * Состояние: устройство выключено
     */
    public function off(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'OFF',
            'voltage' => $this->faker->randomFloat(1, 2.5, 3.5),
            'intensity' => 0,
        ]);
    }

    /**
     * Состояние: низкое напряжение (критическое)
     */
    public function lowBattery(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'SLEEPING',
            'voltage' => $this->faker->randomFloat(2, 2.5, 3.0),
            'intensity' => 0,
        ]);
    }

    /**
     * Состояние: ошибка/авария
     */
    public function error(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'ERROR',
            'voltage' => $this->faker->randomFloat(2, 2.0, 2.5),
            'intensity' => 0,
        ]);
    }
}
