<?php

namespace Database\Seeders\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\Telemetry;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SmartLightTelemetrySeeder extends Seeder
{
    public function run(): void
    {
        // Получаем фейковые устройства
        $fakeDevices = SmartLightDevice::where('is_fake', true)->get();

        // Удаляем старую телеметрию для фейковых устройств
        $fakeDeviceIds = $fakeDevices->pluck('id')->toArray();
        DB::table('smart_light_telemetry')
            ->whereIn('device_id', $fakeDeviceIds)
            ->delete();

        // Создаем телеметрию для каждого фейкового устройства
        $now = now();
        $telemetry = [];

        foreach ($fakeDevices as $device) {
            // Генерируем 24 часа телеметрии
            for ($i = 0; $i < 288; $i++) {
                $voltage = $this->generateVoltage($device);
                $status = $voltage > 3.2 ? 'ON' : 'SLEEPING';
                $intensity = $status === 'ON' ? mt_rand(0, 100) : 0;

                $telemetry[] = [
                    'device_id' => $device->id,
                    'voltage' => $voltage,
                    'status' => $status,
                    'intensity' => $intensity,
                    'is_emergency' => $voltage < 3.0,
                    'received_at' => $now->subMinutes($i * 5),
                    'created_at' => $now->subMinutes($i * 5),
                    'updated_at' => $now->subMinutes($i * 5)
                ];
            }
        }

        // Добавляем телеметрию
        foreach ($telemetry as $item) {
            Telemetry::create($item);
        }
    }

    /**
     * Генерация фейкового напряжения
     */
    private function generateVoltage($device): float
    {
        $baseVoltage = $device->voltage;

        switch ($device->device_id) {
            case 'fake_device_001': // Коридор
                return $baseVoltage + (mt_rand(-5, 5) / 100);
            case 'fake_device_002': // Кухня
                return $baseVoltage + (mt_rand(-10, 10) / 100);
            case 'fake_device_003': // Гостиная
                return 3.1 + (mt_rand(-5, 10) / 100);
            case 'fake_device_004': // Спальня
                return 3.7 + (mt_rand(0, 5) / 100);
            default:
                return $baseVoltage;
        }
    }
}
