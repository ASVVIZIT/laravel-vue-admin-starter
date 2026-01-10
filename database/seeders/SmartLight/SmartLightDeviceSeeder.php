<?php

namespace Database\Seeders\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SmartLightDeviceSeeder extends Seeder
{
    public function run(): void
    {
        // Удаляем ТОЛЬКО фейковые устройства
        SmartLightDevice::where('is_fake', true)->delete();

        // Создаем фейковые устройства
        $fakeDevices = [
            [
                'name' => 'Демо: Коридор',
                'device_id' => 'fake_device_001',
                'status' => 'ON',
                'voltage' => 3.95,
                'battery_capacity' => 2000,
                'critical_voltage' => 3.2,
                'sleep_interval' => 600,
                'emergency_sleep_interval' => 3600,
                'api_key' => Str::random(40),
                'is_fake' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Демо: Кухня',
                'device_id' => 'fake_device_002',
                'status' => 'OFF',
                'voltage' => 3.85,
                'battery_capacity' => 2000,
                'critical_voltage' => 3.2,
                'sleep_interval' => 600,
                'emergency_sleep_interval' => 3600,
                'api_key' => Str::random(40),
                'is_fake' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Демо: Гостиная',
                'device_id' => 'fake_device_003',
                'status' => 'ON',
                'voltage' => 3.15,
                'battery_capacity' => 2000,
                'critical_voltage' => 3.2,
                'sleep_interval' => 600,
                'emergency_sleep_interval' => 3600,
                'api_key' => Str::random(40),
                'is_fake' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Демо: Спальня',
                'device_id' => 'fake_device_004',
                'status' => 'SLEEPING',
                'voltage' => 3.75,
                'battery_capacity' => 2000,
                'critical_voltage' => 3.2,
                'sleep_interval' => 600,
                'emergency_sleep_interval' => 3600,
                'api_key' => Str::random(40),
                'is_fake' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        // Добавляем только фейковые устройства
        foreach ($fakeDevices as $device) {
            SmartLightDevice::create($device);
        }
    }
}
