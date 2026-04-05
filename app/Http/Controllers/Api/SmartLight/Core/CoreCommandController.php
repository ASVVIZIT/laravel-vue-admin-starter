<?php

namespace App\Http\Controllers\Api\SmartLight\Core;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\CommandService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CoreCommandController extends Controller
{
    public function __construct(
        private CommandService $commandService
    ) {}

    /**
     * Get pending command for device (device polling)
     */
    public function getCommand(Request $request, string $device_id)
    {
        try {
            $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
            $command = $this->commandService->getPendingCommand($device);

            return response()->json([
                'success' => true,
                'command' => $command['command'] ?? null,
                'intensity' => $command['intensity'] ?? 100,
                'device_id' => $device_id,
                'has_command' => $command !== null
            ]);
        } catch (\Exception $e) {
            Log::error('CoreCommandController::getCommand', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Ошибка получения команды'], 500);
        }
    }

    /**
     * Send command to device (device polling)
     */
    public function sendCommand(Request $request, string $device_id)
    {
        try {
            $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

            $request->validate([
                'command' => 'required|string|in:ON,OFF,SLEEPING,WAKE_UP,STATUS_UPDATE,EMERGENCY_SLEEP',
                'intensity' => 'nullable|integer|min:0|max:100'
            ]);

            $command = $request->input('command');
            $intensity = $request->input('intensity', 100);

            $result = $this->commandService->sendCommand($device, $command, ['intensity' => $intensity]);

            return response()->json([
                'success' => true,
                'message' => 'Команда отправлена',
                'command' => $command,
                'intensity' => $intensity
            ]);
        } catch (\Exception $e) {
            Log::error('CoreCommandController::sendCommand', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Ошибка отправки команды'], 500);
        }
    }

    /**
     * ✅ ИСПРАВЛЕНО: Переименовано wakeUp → wakeDevice (соответствие маршруту)
     * Force sleep command (frontend)
     */
    public function forceSleep(Request $request, string $device_id)
    {
        try {
            $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
            $result = $this->commandService->sendEmergencySleep($device);

            return response()->json([
                'success' => true,
                'message' => 'Команда сна отправлена',
                'device_id' => $device_id
            ]);
        } catch (\Exception $e) {
            Log::error('CoreCommandController::forceSleep', [
                'device_id' => $device_id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка перевода в сон: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ ИСПРАВЛЕНО: Переименовано wakeUp → wakeDevice (соответствие маршруту)
     * Wake up device (frontend)
     */
    public function wakeDevice(Request $request, string $device_id)
    {
        try {
            $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
            $result = $this->commandService->sendWakeUp($device);

            return response()->json([
                'success' => true,
                'message' => 'Команда пробуждения отправлена',
                'device_id' => $device_id
            ]);
        } catch (\Exception $e) {
            Log::error('CoreCommandController::wakeDevice', [
                'device_id' => $device_id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка пробуждения: ' . $e->getMessage()
            ], 500);
        }
    }
}
