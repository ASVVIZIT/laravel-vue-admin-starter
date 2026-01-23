<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\Telemetry;
use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Support\Facades\DB;

class TelemetryService
{
    /**
     * Create new telemetry record.
     */
    public function createTelemetry(SmartLightDevice $device, array $data): Telemetry
    {
        // Update device voltage and status
        $device->update([
            'voltage' => $data['voltage'],
            'status' => $data['status']
        ]);

        // Check if emergency mode is required
        $isEmergency = $data['voltage'] < $device->critical_voltage;

        // Create telemetry record
        return Telemetry::create([
            'device_id' => $device->id,
            'voltage' => $data['voltage'],
            'status' => $data['status'],
            'intensity' => $data['intensity'] ?? 100,
            'is_emergency' => $isEmergency,
            'received_at' => now()
        ]);
    }

    /**
     * Get latest telemetry for device.
     */
    public function getLatestTelemetry(SmartLightDevice $device): ?Telemetry
    {
        return $device->telemetry()->latest()->first();
    }

    /**
     * Get telemetry history for device.
     */
    public function getTelemetryHistory(SmartLightDevice $device, int $limit = 100): \Illuminate\Support\Collection
    {
        return $device->telemetry()
            ->orderBy('received_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Delete old telemetry records.
     */
    public function deleteOldTelemetry(SmartLightDevice $device, int $days): int
    {
        $cutoffDate = now()->subDays($days);

        return Telemetry::where('device_id', $device->id)
            ->where('received_at', '<', $cutoffDate)
            ->delete();
    }

    /**
     * Get battery statistics.
     */
    public function getBatteryStats(SmartLightDevice $device): array
    {
        $last24Hours = now()->subHours(24);

        $telemetry = $device->telemetry()
            ->where('received_at', '>=', $last24Hours)
            ->orderBy('received_at', 'asc')
            ->get();

        if ($telemetry->isEmpty()) {
            return [
                'current_voltage' => $device->voltage,
                'avg_voltage' => $device->voltage,
                'voltage_drop_24h' => 0,
                'estimated_runtime' => $device->estimated_runtime
            ];
        }

        $firstVoltage = $telemetry->first()->voltage;
        $latestVoltage = $telemetry->last()->voltage;
        $avgVoltage = $telemetry->avg('voltage');

        return [
            'current_voltage' => $latestVoltage,
            'avg_voltage' => $avgVoltage,
            'voltage_drop_24h' => $firstVoltage - $latestVoltage,
            'estimated_runtime' => $device->estimated_runtime
        ];
    }
}
