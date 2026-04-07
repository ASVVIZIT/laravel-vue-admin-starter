<?php

namespace App\Http\Controllers\Api\SmartLight\Core;

use App\Http\Controllers\Controller;
use App\Http\Requests\SmartLight\Core\CoreUpdateDeviceSettingsRequest;
use App\Http\Resources\SmartLight\Core\CoreDeviceSettingsResource;
use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\DeviceSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CoreDeviceSettingsController extends Controller
{
    public function __construct(private DeviceSettingsService $settingsService) {}

    /**
     * Display device settings.
     */
    public function show(string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        return response()->json([
            'success' => true,
            'data' => new CoreDeviceSettingsResource($device),
        ]);
    }

    /**
     * Update device settings.
     */
    public function update(CoreUpdateDeviceSettingsRequest $request, string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        Log::info('Settings update request', [
            'device_id' => $device_id,
            'payload' => $request->validated(),
        ]);

        try {
            $updatedSettings = $this->settingsService->updateDeviceSettings(
                $device,
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Настройки обновлены',
                'data' => $updatedSettings,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reset device settings to defaults.
     */
    public function reset(string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        $resetSettings = $this->settingsService->resetDeviceSettings($device);

        return response()->json([
            'success' => true,
            'message' => 'Настройки сброшены',
            'data' => $resetSettings,
        ]);
    }

    /**
     * Get default settings for device type.
     */
    public function getDefaults(Request $request, string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        $batteryDefaults = [
            'li-ion-18650' => [
                'name' => 'Li-ion 18650',
                'min_voltage' => 2.5,
                'max_voltage' => 4.2,
                'critical_voltage' => 3.0,
            ],
            'li-ion-21700' => [
                'name' => 'Li-ion 21700',
                'min_voltage' => 2.5,
                'max_voltage' => 4.2,
                'critical_voltage' => 3.0,
            ],
            'li-po' => [
                'name' => 'Li-Po',
                'min_voltage' => 3.0,
                'max_voltage' => 4.35,
                'critical_voltage' => 3.2,
            ],
            'lead-acid' => [
                'name' => 'Свинцово-кислотный',
                'min_voltage' => 10.5,
                'max_voltage' => 14.4,
                'critical_voltage' => 11.0,
            ],
        ];

        return response()->json([
            'success' => true,
            'default_settings' => [
                'critical_voltage' => $device->critical_voltage,
                'sleep_interval' => $device->sleep_interval,
                'emergency_sleep_interval' => $device->emergency_sleep_interval,
                'battery_group_config' => [
                    'enabled' => false,
                    'type' => 'series',
                    'count' => 1,
                ],
            ],
            'battery_types' => $batteryDefaults,
        ]);
    }

    /**
     * Get settings for device authentication (polling).
     */
    public function getForDeviceAuth(Request $request, string $device_id)
    {
        $device = $request->device;

        return response()->json([
            'success' => true,
            'data' => $this->settingsService->getDeviceSettings($device),
        ]);
    }
}
