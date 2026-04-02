<?php

namespace App\Http\Controllers\Api\SmartLight\Core;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\SmartLightDevice;
use App\Http\Resources\SmartLight\Core\CoreDeviceResource;
use App\Http\Resources\SmartLight\Core\CoreDeviceCollection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

abstract class CoreDeviceController extends Controller
{
    /**
     * Display a listing of devices
     */
    public function index(Request $request): JsonResponse
    {
        $query = SmartLightDevice::query();

        // Filter by user if not admin
        if (!$request->user()->can('manage-all-smartlight')) {
            $query->where('user_id', $request->user()->id);
        }

        // Search
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('device_id', 'like', "%{$search}%");
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by fake/real
        if ($request->has('fake')) {
            $query->where('is_fake', $request->boolean('fake'));
        }

        $perPage = $request->input('per_page', 10);
        $devices = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => new CoreDeviceCollection($devices),
            'meta' => [
                'total' => $devices->total(),
                'per_page' => $devices->perPage(),
                'current_page' => $devices->currentPage(),
                'last_page' => $devices->lastPage(),
                'from' => $devices->firstItem(),
                'to' => $devices->lastItem()
            ]
        ]);
    }

    /**
     * Display the specified device
     */
    public function show($device_id): JsonResponse
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

        $this->authorize('view', $device);

        return response()->json([
            'success' => true,
            'data' => new CoreDeviceResource($device)
        ]);
    }

    /**
     * Get devices for dropdown
     */
    public function listForDropdown(Request $request): JsonResponse
    {
        $query = SmartLightDevice::query();

        if (!$request->user()->can('manage-all-smartlight')) {
            $query->where('user_id', $request->user()->id);
        }

        $devices = $query->select('id', 'device_id as id', 'name as label')->get();

        return response()->json([
            'success' => true,
            'data' => $devices
        ]);
    }

    /**
     * Check device ownership
     */
    public function checkOwnership(Request $request, $device_id): JsonResponse
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $user = $request->user();

        $ownsDevice = ($user && $device->user_id === $user->id) ||
            ($user && $user->can('manage-all-smartlight'));

        return response()->json([
            'success' => true,
            'owns_device' => $ownsDevice,
            'device_id' => $device_id,
            'user_id' => $user ? $user->id : null,
            'device_owner_id' => $device->user_id,
            'user_can_manage_all' => $user ? $user->can('manage-all-smartlight') : false
        ]);
    }

    /**
     * Get device settings (for device auth)
     */
    public function getSettings(Request $request): JsonResponse
    {
        $device = $request->device;

        return response()->json([
            'success' => true,
            'data' => [
                'server_url' => $device->settings['server_url'] ?? config('app.url') . '/api/smart-light',
                'critical_voltage' => $device->critical_voltage,
                'sleep_interval' => $device->sleep_interval,
                'emergency_sleep_interval' => $device->emergency_sleep_interval,
                'app_host' => config('app.host') ?? parse_url(config('app.url'), PHP_URL_HOST),
                'device_type' => $device->device_type,
                'power_config' => [
                    'shared_power_source' => true,
                    'controller_runtime' => 24 * 60 * 60,
                    'min_controller_voltage' => 2.8,
                    'power_management_mode' => 'conservative'
                ]
            ]
        ]);
    }

    /**
     * Register new device
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'mac_address' => 'required|string|regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
            'device_type' => 'required|string|in:node_mcu_v3,esp32,esp8266,custom'
        ]);

        $user = $request->user();

        $device = SmartLightDevice::create([
            'user_id' => $user ? $user->id : null,
            'name' => 'Светильник ' . \Str::random(4),
            'device_id' => 'LIGHT_' . \Str::upper(\Str::random(8)),
            'device_type' => $request->device_type,
            'battery_capacity' => 2000,
            'critical_voltage' => 3.2,
            'sleep_interval' => 600,
            'emergency_sleep_interval' => 3600,
            'status' => 'OFF',
            'voltage' => 3.7,
            'api_key' => \Str::random(32),
            'settings' => [
                'server_url' => config('app.url') . '/api/smart-light'
            ]
        ]);

        return response()->json([
            'success' => true,
            'device_id' => $device->device_id,
            'api_key' => $device->api_key,
            'settings' => $device->settings
        ]);
    }

    /**
     * Force sleep device
     */
    public function forceSleep(Request $request, $device_id): JsonResponse
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

        $this->authorize('update', $device);

        $device->update(['status' => 'SLEEPING']);

        return response()->json([
            'success' => true,
            'message' => 'Устройство переведено в спящий режим',
            'data' => new CoreDeviceResource($device)
        ]);
    }

    /**
     * Wake up device
     */
    public function wakeDevice(Request $request, $device_id): JsonResponse
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

        $this->authorize('update', $device);

        $device->update([
            'status' => 'ON',
            'intensity' => 100
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Устройство пробуждено',
            'data' => new CoreDeviceResource($device)
        ]);
    }
}
