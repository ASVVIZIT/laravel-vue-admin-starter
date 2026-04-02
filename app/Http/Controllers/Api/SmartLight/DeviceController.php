<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\GlobalSetting;
use App\Services\SmartLight\DeviceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use App\Events\SmartLight\DeviceCommandSent;

class DeviceController extends Controller
{
    public function __construct(
        private DeviceService $deviceService
    ) {
        $this->authorizeResource(SmartLightDevice::class, 'device');
    }

    /**
     * Register new device
     */
    public function register(Request $request)
    {
        $request->validate([
            'mac_address' => 'required|string',
            'device_type' => 'required|string|in:node_mcu_v3,esp32,esp8266,custom'
        ]);

        $user = Auth::user();
        $device = SmartLightDevice::create([
            'user_id' => $user ? $user->id : null,
            'name' => 'Светильник ' . Str::random(4),
            'device_id' => 'LIGHT_' . Str::upper(Str::random(8)),
            'device_type' => $request->device_type,
            'battery_capacity' => 2000,
            'critical_voltage' => (float)GlobalSetting::get('default_critical_voltage', 3.2),
            'sleep_interval' => (int)GlobalSetting::get('default_sleep_interval', 600),
            'emergency_sleep_interval' => (int)GlobalSetting::get('default_emergency_sleep_interval', 3600),
            'status' => 'OFF',
            'voltage' => 3.7,
            'api_key' => Str::random(32),
            'settings' => [
                'server_url' => GlobalSetting::get('global_server_url', config('app.url') . '/api/smart-light')
            ]
        ]);

        return response()->json([
            'success' => true,
            'device_id' => $device->device_id,
            'api_key' => $device->api_key,
            'settings' => $device->getSettingsAttribute()
        ]);
    }

    /**
     * Get device settings
     */
    public function getSettings(Request $request, $device_id)
    {
        $device = $request->device;

        return response()->json([
            'success' => true,
            'data' => [
                'server_url' => $device->settings['server_url'] ?? GlobalSetting::get('global_server_url', config('app.url') . '/api/smart-light'),
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
     * Force sleep device
     */
    public function forceSleep(Request $request, $device_id)
    {
        $device = $request->device;

        $this->deviceService->forceSleep($device);

        Cache::put("cmd_{$device_id}", [
            'command' => 'EMERGENCY_SLEEP',
            'timestamp' => now()->timestamp
        ], 120);

        event(new DeviceCommandSent($device_id, 'EMERGENCY_SLEEP'));

        return response()->json([
            'success' => true,
            'message' => 'Команда сна отправлена',
            'device_id' => $device_id,
            'sleep_interval' => $device->emergency_sleep_interval
        ]);
    }

    /**
     * Wake up device
     */
    public function wakeDevice(Request $request, $device_id)
    {
        $device = $request->device;

        $this->deviceService->wakeDevice($device);

        Cache::put("cmd_{$device_id}", [
            'command' => 'WAKE_UP',
            'timestamp' => now()->timestamp
        ], 120);

        event(new DeviceCommandSent($device_id, 'WAKE_UP', 100));

        return response()->json([
            'success' => true,
            'message' => 'Устройство пробуждено',
            'device_id' => $device_id
        ]);
    }

    /**
     * Check device ownership
     */
    public function checkOwnership(Request $request, $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $user = $request->user();
        $ownsDevice = ($user && $device->user_id === $user->id) ||
            ($user && $user->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT));

        return response()->json([
            'success' => true,
            'owns_device' => $ownsDevice,
            'device_id' => $device_id,
            'user_id' => $user ? $user->id : null,
            'device_owner_id' => $device->user_id,
            'user_can_manage_all' => $user ? $user->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT) : false
        ]);
    }

    /**
     * Get all devices
     */
    public function index(Request $request)
    {
        $query = SmartLightDevice::query();

        if (!$request->user()->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            $query->where('user_id', $request->user()->id);
        }

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('device_id', 'like', "%{$search}%");
        }

        $perPage = $request->input('per_page', 10);
        $devices = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $devices->items(),
            'meta' => [
                'total' => $devices->total(),
                'per_page' => $devices->perPage(),
                'current_page' => $devices->currentPage(),
                'last_page' => $devices->lastPage()
            ]
        ]);
    }

    /**
     * Get devices for dropdown
     */
    public function listForDropdown(Request $request)
    {
        $query = SmartLightDevice::query();

        if (!$request->user()->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            $query->where('user_id', $request->user()->id);
        }

        $devices = $query->select('id', 'device_id as id', 'name as label')->get();

        return response()->json([
            'success' => true,
            'data' => $devices
        ]);
    }

    /**
     * Get single device by ID
     */
    public function show($device_id)
    {
        $device = $this->deviceService->findDeviceByDeviceId($device_id);

        return response()->json([
            'success' => true,
            'data' => $device
        ]);
    }

    /**
     * V1 API: Get all devices
     */
    public function apiIndex(Request $request)
    {
        return $this->index($request);
    }
}
