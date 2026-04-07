<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CommandService
{
    /**
     * Send command to device.
     */
    public function sendCommand(SmartLightDevice $device, string $command, array $data = []): array
    {
        Log::channel('smartlight')->debug('CommandService: Sending command', [
            'device_id' => $device->device_id,
            'command' => $command,
            'data' => $data,
        ]);

        $commandData = [
            'command' => $command,
            'timestamp' => now()->timestamp,
            'data' => $data,
        ];

        $cacheKey = "cmd_{$device->device_id}";
        Cache::put($cacheKey, $commandData, 120);

        Log::channel('smartlight')->info('Command sent successfully', [
            'device_id' => $device->device_id,
            'command' => $command,
        ]);

        return [
            'success' => true,
            'message' => 'Команда отправлена',
        ];
    }

    /**
     * Get pending command for device.
     */
    public function getPendingCommand(SmartLightDevice $device): ?array
    {
        $cacheKey = "cmd_{$device->device_id}";
        $command = Cache::get($cacheKey);

        if ($command) {
            Cache::forget($cacheKey);

            Log::channel('smartlight')->debug('Command retrieved and removed from cache', [
                'device_id' => $device->device_id,
                'command' => $command['command'],
            ]);
        }

        return $command;
    }

    /**
     * Send emergency sleep command.
     */
    public function sendEmergencySleep(SmartLightDevice $device, array $options = []): array
    {
        Log::channel('smartlight')->debug('CommandService: Sending emergency sleep', [
            'device_id' => $device->device_id,
        ]);

        $data = [
            'reason' => $options['reason'] ?? 'low_battery',
            'emergency_mode' => true,
            'priority' => 3,
        ];

        return $this->sendCommand($device, 'EMERGENCY_SLEEP', $data);
    }

    /**
     * Send wake up command.
     */
    public function sendWakeUp(SmartLightDevice $device): array
    {
        Log::channel('smartlight')->debug('CommandService: Sending wake up', [
            'device_id' => $device->device_id,
        ]);

        return $this->sendCommand($device, 'WAKE_UP', ['intensity' => 100]);
    }
}
