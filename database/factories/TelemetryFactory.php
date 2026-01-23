<?php

namespace Database\Factories;

use App\Models\SmartLight\Telemetry;
use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Database\Eloquent\Factories\Factory;

class TelemetryFactory extends Factory
{
    protected $model = Telemetry::class;

    public function definition(): array
    {
        return [
            'device_id' => SmartLightDevice::factory(),
            'voltage' => $this->faker->randomFloat(1, 2.5, 4.2),
            'status' => $this->faker->randomElement(['ON', 'OFF', 'SLEEPING']),
            'intensity' => $this->faker->numberBetween(0, 100),
            'is_emergency' => $this->faker->boolean(10), // 10% chance for emergency
            'received_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }
}
