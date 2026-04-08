<?php

namespace Database\Seeders\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\Telemetry;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * ============================================================================
 * SMARTLIGHT — СИДЕР ТЕЛЕМЕТРИИ
 * ============================================================================
 * 📁 Путь: database/seeders/SmartLight/SmartLightTelemetrySeeder.php
 * ✅ Очистка: Удаляет старую телеметрию для фейковых устройств
 * ✅ Генерация: 288 точек (5 мин × 24 часа) для каждого фейкового устройства
 * ✅ Статистика: Считает реальные записи после вставки
 * ============================================================================
 */

class SmartLightTelemetrySeeder extends Seeder
{
    public function run(): void
    {
        // Получаем только фейковые устройства (для них генерируем телеметрию)
        $fakeDevices = SmartLightDevice::where('is_fake', true)->get();

        if ($fakeDevices->isEmpty()) {
            $this->command->warn('   ⚠️ Нет фейковых устройств для генерации телеметрии');
            return;
        }

        // Удаляем старую телеметрию для этих устройств (чтобы не дублировать)
        $fakeDeviceIds = $fakeDevices->pluck('id')->toArray();
        $deletedTelemetry = DB::table('smart_light_telemetry')
            ->whereIn('device_id', $fakeDeviceIds)
            ->delete();

        if ($deletedTelemetry > 0) {
            $this->command->info("   🧹 Удалено старой телеметрии: <fg=yellow>{$deletedTelemetry}</>");
        }

        // Генерируем телеметрию
        $now = now();
        $telemetryBatch = [];
        $totalPoints = 0;

        foreach ($fakeDevices as $device) {
            // Генерируем 288 точек (каждые 5 минут за 24 часа)
            for ($i = 0; $i < 288; $i++) {
                $voltage = $this->generateVoltage($device, $i);
                $status = $this->determineStatus($voltage, $device->critical_voltage);
                $intensity = $status === 'ON' ? mt_rand(0, 100) : 0;

                $telemetryBatch[] = [
                    'device_id' => $device->id,
                    'voltage' => $voltage,
                    'status' => $status,
                    'intensity' => $intensity,
                    'is_emergency' => $voltage < ($device->critical_voltage - 0.2),
                    'received_at' => $now->copy()->subMinutes($i * 5),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Пакетная вставка каждые 100 записей (оптимизация)
                if (count($telemetryBatch) >= 100) {
                    Telemetry::insert($telemetryBatch);
                    $totalPoints += count($telemetryBatch);
                    $telemetryBatch = [];
                }
            }
        }

        // Вставка остатка
        if (!empty($telemetryBatch)) {
            Telemetry::insert($telemetryBatch);
            $totalPoints += count($telemetryBatch);
        }

        // Вывод РЕАЛЬНОЙ статистики
        $this->printStatistics($totalPoints);
    }

    /**
     * Генерация реалистичного напряжения с плавными изменениями
     */
    private function generateVoltage($device, int $minuteIndex): float
    {
        $baseVoltage = $device->voltage ?? 3.7;
        $criticalVoltage = $device->critical_voltage ?? 3.0;

        // Плавное изменение в зависимости от устройства
        $variation = match ($device->device_id) {
            'fake_device_001' => (mt_rand(-5, 5) / 100),  // Коридор: стабильно
            'fake_device_002' => (mt_rand(-10, 10) / 100), // Кухня: колебания
            'fake_device_003' => (mt_rand(-5, 10) / 100),  // Гостиная: рост
            'fake_device_004' => (mt_rand(0, 5) / 100),    // Спальня: разряд
            default => (mt_rand(-8, 8) / 100),             // Остальные: случай
        };

        // Добавляем тренд разряда для устройств в режиме SLEEPING
        if ($device->status === 'SLEEPING') {
            $discharge = ($minuteIndex / 288) * 0.3; // Плавный разряд на 0.3В за сутки
            $variation -= $discharge;
        }

        $result = $baseVoltage + $variation;

        // Ограничиваем в разумных пределах
        return round(max($criticalVoltage - 0.5, min(4.3, $result)), 2);
    }

    /**
     * Определение статуса на основе напряжения
     */
    private function determineStatus(float $voltage, float $criticalVoltage): string
    {
        if ($voltage < $criticalVoltage - 0.3) return 'ERROR';
        if ($voltage < $criticalVoltage) return 'SLEEPING';
        return 'ON';
    }

    /**
     * Вывод РЕАЛЬНОЙ статистики телеметрии
     */
    private function printStatistics(int $generatedPoints): void
    {
        $totalTelemetry = Telemetry::count();
        $emergencyCount = Telemetry::where('is_emergency', true)->count();

        $this->command->info("   📊 <bg=blue;fg=white> ТЕЛЕМЕТРИЯ </>");
        $this->command->line("      📈 Сгенерировано: <fg=green>{$generatedPoints}</> точек");
        $this->command->line("      💾 Всего в БД: <fg=cyan>{$totalTelemetry}</> записей");
        $this->command->line("      🚨 Аварийных: <fg=red>{$emergencyCount}</>");
        $this->command->newLine();
    }
}
