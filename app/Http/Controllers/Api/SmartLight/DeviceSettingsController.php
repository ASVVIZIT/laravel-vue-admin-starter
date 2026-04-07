<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;
use App\Http\Requests\SmartLight\Core\CoreUpdateDeviceSettingsRequest;
use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\DeviceSettingsService;
use Illuminate\Http\Request;

class DeviceSettingsController extends Controller
{
    public function __construct(
        private DeviceSettingsService $settingsService
    ) {}

    /**
     * Display device settings
     */
    public function show($device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        return response()->json([
            'success' => true,
            'data' => $this->settingsService->getDeviceSettings($device)
        ]);
    }

    /**
     * Update device settings
     */
    public function update(CoreUpdateDeviceSettingsRequest $request, $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        return response()->json([
            'success' => true,
            'data' => $this->settingsService->updateDeviceSettings($device, $request->validated())
        ]);
    }

    /**
     * Reset device settings
     */
    public function reset($device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        return response()->json([
            'success' => true,
            'data' => $this->settingsService->resetDeviceSettings($device)
        ]);
    }

    /**
     * Get device settings for device auth
     */
    public function getDeviceSettingsForDevice(Request $request, $device_id)
    {
        $device = $request->device;
        return response()->json([
            'success' => true,
            'data' => $this->settingsService->getDeviceSettings($device)
        ]);
    }

    /**
     * Get default settings for device type
     */
    public function getDefaults(Request $request, $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        $defaults = [
            'success' => true,
            'default_settings' => [
                'critical_voltage' => $device->critical_voltage,
                'sleep_interval' => $device->sleep_interval,
                'emergency_sleep_interval' => $device->emergency_sleep_interval
            ],
            'battery_types' => [
                'li-ion-18650' => [
                    'name' => 'Li-ion 18650',
                    'min_voltage' => 2.5,
                    'max_voltage' => 4.2,
                    'critical_voltage' => 3.0
                ],
                'li-ion-21700' => [
                    'name' => 'Li-ion 21700',
                    'min_voltage' => 2.5,
                    'max_voltage' => 4.2,
                    'critical_voltage' => 3.0
                ],
                'li-po' => [
                    'name' => 'Li-Po',
                    'min_voltage' => 2.8,
                    'max_voltage' => 4.35,
                    'critical_voltage' => 3.2
                ],
                'lead-acid' => [
                    'name' => 'Свинцово-кислотный',
                    'min_voltage' => 10.5,
                    'max_voltage' => 14.4,
                    'critical_voltage' => 11.0
                ]
            ]
        ];

        return response()->json($defaults);
    }

    /**
     * V1 API: Show device settings
     */
    public function apiShow($device_id)
    {
        return $this->show($device_id);
    }

    /**
     * V1 API: Update device settings
     */
    public function apiUpdate(CoreUpdateDeviceSettingsRequest $request, $device_id)
    {
        return $this->update($request, $device_id);
    }

    /**
     * V1 API: Reset device settings
     */
    public function apiReset($device_id)
    {
        return $this->reset($device_id);
    }
}
