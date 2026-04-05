<?php

namespace Database\Seeders\SmartLight;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\Telemetry;
use Illuminate\Support\Str;

class SmartLightSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDevicesWithAllStatuses();
        $this->seedDevicesWithExtremeVoltages();
        $this->seedDevicesWithAllTypes();
        $this->seedTelemetryForDevices();
    }

    private function seedDevicesWithAllStatuses(): void
    {
        $statuses = [
            ['status' => 'ON', 'name_suffix' => 'ВКЛ', 'intensity' => 100, 'voltage' => 3.9],
            ['status' => 'OFF', 'name_suffix' => 'ВЫКЛ', 'intensity' => 0, 'voltage' => 3.7],
            ['status' => 'SLEEPING', 'name_suffix' => 'СОН', 'intensity' => 0, 'voltage' => 3.5],
            ['status' => 'ERROR', 'name_suffix' => 'ОШИБКА', 'intensity' => 0, 'voltage' => 2.4],
        ];

        foreach ($statuses as $config) {
            SmartLightDevice::create([
                'user_id' => null,
                'name' => "Тест: {$config['name_suffix']}",
                'device_id' => 'test_status_' . strtolower($config['status']) . '_' . Str::random(4),
                'device_type' => 'node_mcu_v3',
                'battery_type_id' => 'li-ion-18650',  // ✅ ID из сидера миграции
                'bulb_type_id' => 'classic',
                'power_supply_id' => 'standard',
                'battery_capacity' => 2000,
                'critical_voltage' => 3.2,
                'sleep_interval' => 600,
                'emergency_sleep_interval' => 3600,
                'status' => $config['status'],
                'voltage' => $config['voltage'],
                'intensity' => $config['intensity'],
                'api_key' => Str::random(32),
                'is_fake' => true,
                'settings' => ['test_scenario' => 'all_statuses'],
            ]);
        }
    }

    private function seedDevicesWithExtremeVoltages(): void
    {
        $voltageScenarios = [
            ['name' => 'Мин. напряжение', 'voltage' => 2.5, 'expected_behavior' => 'low_power'],
            ['name' => 'Крит. напряжение', 'voltage' => 3.0, 'expected_behavior' => 'warning'],
            ['name' => 'Норма', 'voltage' => 3.7, 'expected_behavior' => 'normal'],
            ['name' => 'Макс. напряжение', 'voltage' => 4.2, 'expected_behavior' => 'full'],
            ['name' => 'Перезаряд', 'voltage' => 4.3, 'expected_behavior' => 'overcharge'],
        ];

        foreach ($voltageScenarios as $scenario) {
            SmartLightDevice::create([
                'user_id' => null,
                'name' => "Тест: {$scenario['name']}",
                'device_id' => 'test_voltage_' . Str::slug($scenario['name']) . '_' . Str::random(4),
                'device_type' => 'esp32',
                'battery_type_id' => 'li-ion-18650',
                'bulb_type_id' => 'led',
                'power_supply_id' => 'solar',
                'battery_capacity' => 3500,
                'critical_voltage' => 3.0,
                'sleep_interval' => 300,
                'emergency_sleep_interval' => 1800,
                'status' => 'ON',
                'voltage' => $scenario['voltage'],
                'intensity' => 50,
                'api_key' => Str::random(32),
                'is_fake' => true,
                'settings' => ['test_scenario' => 'extreme_voltages', 'expected' => $scenario['expected_behavior']],
            ]);
        }
    }

    private function seedDevicesWithAllTypes(): void
    {
        // ✅ Используем ID из миграции (они же первичные ключи в smart_light_*_types)
        $batteryTypes = ['li-ion-18650', 'li-ion-21700', 'li-po', 'lead-acid'];
        $bulbTypes = ['classic', 'led', 'halogen', 'smart-rgb'];
        $powerSupplies = ['standard', 'solar', 'grid', 'usb-5v'];

        $combinations = 0;
        foreach ($batteryTypes as $battery) {
            foreach ($bulbTypes as $bulb) {
                foreach ($powerSupplies as $power) {
                    $combinations++;
                    SmartLightDevice::create([
                        'user_id' => null,
                        'name' => "Тип: {$battery}/{$bulb}/{$power}",
                        'device_id' => 'test_types_' . $combinations . '_' . Str::random(4),
                        'device_type' => 'node_mcu_v3',
                        'battery_type_id' => $battery,  // ✅ Строковый ID
                        'bulb_type_id' => $bulb,
                        'power_supply_id' => $power,
                        'battery_capacity' => 2000,
                        'critical_voltage' => 3.2,
                        'sleep_interval' => 600,
                        'emergency_sleep_interval' => 3600,
                        'status' => 'ON',
                        'voltage' => 3.7,
                        'intensity' => 75,
                        'api_key' => Str::random(32),
                        'is_fake' => true,
                        'settings' => ['test_scenario' => 'all_types'],
                    ]);
                }
            }
        }
    }

    private function seedTelemetryForDevices(): void
    {
        $devices = SmartLightDevice::where('is_fake', true)->get();

        foreach ($devices as $device) {
            for ($hour = 24; $hour >= 0; $hour--) {
                $timestamp = now()->subHours($hour);
                $baseVoltage = $device->voltage;
                $voltageVariation = $this->faker->randomFloat(2, -0.2, 0.2);
                $intensityVariation = $device->status === 'ON' ? $this->faker->numberBetween(-10, 10) : 0;

                Telemetry::create([
                    'device_id' => $device->id,
                    'voltage' => max(2.0, min(4.5, $baseVoltage + $voltageVariation)),
                    'status' => $device->status,
                    'intensity' => max(0, min(100, $device->intensity + $intensityVariation)),
                    'is_emergency' => ($baseVoltage + $voltageVariation) < 2.8,
                    'received_at' => $timestamp,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }
    }
}
