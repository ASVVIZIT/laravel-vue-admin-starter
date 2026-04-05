<?php

namespace Database\Factories;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SmartLightDeviceFactory extends Factory
{
    protected $model = SmartLightDevice::class;

    public function definition(): array
    {
        $isFake = $this->faker->boolean(70); // 70% chance to be fake

        return [
            'user_id' => $isFake ? null : \App\Models\User::factory(),
            'name' => $this->faker->words(3, true),
            'device_id' => $isFake ? 'fake_device_' . Str::random(8) : 'real_device_' . Str::random(8),
            'device_type' => $this->faker->randomElement(['node_mcu_v3', 'esp32', 'raspberry_pi']),
            'battery_capacity' => $this->faker->numberBetween(1500, 5000),
            'critical_voltage' => $this->faker->randomFloat(1, 2.5, 4.2),
            'sleep_interval' => $this->faker->numberBetween(300, 3600),
            'emergency_sleep_interval' => $this->faker->numberBetween(600, 7200),
            'status' => $this->faker->randomElement(['ON', 'OFF', 'SLEEPING']),
            'voltage' => $this->faker->randomFloat(1, 2.5, 4.2),
            'api_key' => Str::random(32),
            'settings' => null,
            'is_fake' => $isFake,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }
}
