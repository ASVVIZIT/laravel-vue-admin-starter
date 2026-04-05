<?php
namespace App\Http\Controllers\Api\SmartLight\V0;

use App\Http\Controllers\Api\SmartLight\Core\CoreDeviceController;
use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\CommandService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class V0CommandController extends CoreDeviceController
{
    public function __construct(
        private CommandService $commandService
    ) {}

    /**
     * Get pending command for device
     */
    public function getCommand(Request $request, $device_id)
    {
        try {
            // Ищем устройство по device_id
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
            Log::error('CommandController::getCommand error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка получения команды'
            ], 500);
        }
    }

    /**
     * Send command to device
     */
    public function sendCommand(Request $request, $device_id)
    {
        try {
            // Ищем устройство по device_id
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
            Log::error('CommandController::sendCommand error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка отправки команды'
            ], 500);
        }
    }

    /**
     * Force sleep command (V0 API)
     */
    public function forceSleep(Request $request, $device_id)
    {
        try {
            // Ищем устройство по device_id
            $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

            $result = $this->commandService->sendEmergencySleep($device);

            return response()->json([
                'success' => true,
                'message' => 'Команда сна отправлена',
                'device_id' => $device_id
            ]);
        } catch (\Exception $e) {
            Log::error('CommandController::forceSleep error', [
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
     * Wake up command (V0 API)
     */
    public function wakeDevice(Request $request, $device_id)
    {
        try {
            // Ищем устройство по device_id
            $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

            $result = $this->commandService->sendWakeUp($device);

            return response()->json([
                'success' => true,
                'message' => 'Команда пробуждения отправлена',
                'device_id' => $device_id
            ]);
        } catch (\Exception $e) {
            Log::error('CommandController::wakeUp error', [
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
