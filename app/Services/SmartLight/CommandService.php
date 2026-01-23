<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CommandService
{
    /**
     * Send command to device
     */
    public function sendCommand(SmartLightDevice $device, string $command, array $data = []): bool
    {
        Log::channel('smartlight')->debug('CommandService: Sending command', [
            'device_id' => $device->device_id,
            'command' => $command,
            'data' => $data
        ]);

        // Save to cache for device polling
        $commandData = [
            'command' => $command,
            'timestamp' => now()->timestamp,
            'data' => $data
        ];

        // Store command in cache with expiration (2 minutes)
        $cacheKey = "cmd_{$device->device_id}";
        Cache::put($cacheKey, $commandData, 120);

        Log::channel('smartlight')->info('Command sent successfully', [
            'device_id' => $device->device_id,
            'command' => $command,
            'cache_key' => $cacheKey
        ]);

        return true;
    }

    /**
     * Get pending command for device
     */
    public function getPendingCommand(SmartLightDevice $device): ?array
    {
        $cacheKey = "cmd_{$device->device_id}";
        $command = Cache::get($cacheKey);

        if ($command) {
            // Remove command after retrieval
            Cache::forget($cacheKey);
            Log::channel('smartlight')->debug('Command retrieved and removed from cache', [
                'device_id' => $device->device_id,
                'command' => $command['command']
            ]);
        }

        return $command;
    }

    /**
     * Send emergency sleep command
     */
    public function sendEmergencySleep(SmartLightDevice $device, array $options = []): bool
    {
        $data = [
            'reason' => $options['reason'] ?? 'low_battery',
            'emergency_mode' => true,
            'priority' => 3 // Highest priority
        ];

        return $this->sendCommand($device, 'EMERGENCY_SLEEP', $data);
    }

    /**
     * Send wake up command
     */
    public function sendWakeUp(SmartLightDevice $device): bool
    {
        return $this->sendCommand($device, 'WAKE_UP');
    }

    /**
     * Send status update command
     */
    public function sendStatusUpdate(SmartLightDevice $device, array $statusData): bool
    {
        return $this->sendCommand($device, 'STATUS_UPDATE', $statusData);
    }
}
