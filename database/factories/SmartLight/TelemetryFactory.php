<?php

namespace Database\Factories\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\Telemetry;
use Illuminate\Database\Eloquent\Factories\Factory;
use function now;

class TelemetryFactory extends Factory
{
    protected $model = Telemetry::class;

    public function definition(): array
    {
        $device = SmartLightDevice::inRandomOrder()->first() ?? SmartLightDevice::factory()->create();

        // Напряжение зависит от статуса устройства
        $baseVoltage = $device->voltage ?? 3.7;
        $status = $device->status ?? 'ON';

        $voltageVariation = match($status) {
            'ON' => $this->faker->randomFloat(2, -0.1, 0.1),
            'SLEEPING' => $this->faker->randomFloat(2, -0.3, 0),
            'OFF' => $this->faker->randomFloat(2, -0.5, 0.2),
            'ERROR' => $this->faker->randomFloat(2, -1.0, 0),
            default => 0,
        };

        $intensity = $status === 'ON' ? $this->faker->numberBetween(0, 100) : 0;

        return [
            'device_id' => $device->id,
            'voltage' => round(max(2.0, min(4.5, $baseVoltage + $voltageVariation)), 2),
            'status' => $status,
            'intensity' => $intensity,
            'is_emergency' => ($baseVoltage + $voltageVariation) < 2.8,
            'received_at' => $this->faker->dateTimeBetween('-24 hours', 'now'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Телеметрия с экстремальными значениями
     */
    public function extreme(): static
    {
        return $this->state(fn(array $attributes) => [
            'voltage' => $this->faker->randomElement([2.0, 2.5, 4.2, 4.3]),
            'is_emergency' => true,
            'intensity' => $this->faker->randomElement([0, 100]),
        ]);
    }

    /**
     * Телеметрия за последний час
     */
    public function recent(): static
    {
        return $this->state(fn(array $attributes) => [
            'received_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
        ]);
    }
}
