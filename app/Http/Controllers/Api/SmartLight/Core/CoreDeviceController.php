<?php

namespace App\Http\Controllers\Api\SmartLight\Core;

use App\Http\Controllers\Controller;
use App\Http\Resources\SmartLight\Core\CoreDeviceResource;
use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\DeviceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Events\SmartLight\DeviceCommandSent;

class CoreDeviceController extends Controller
{
    public function __construct(private DeviceService $deviceService) {}

    public function index(Request $request)
    {
        $query = SmartLightDevice::query();
        if (!Auth::user()?->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) { $query->where('user_id', Auth::id()); }
        if ($search = $request->input('search')) { $query->where(function($q) use ($search) { $q->where('name', 'like', "%{$search}%")->orWhere('device_id', 'like', "%{$search}%"); }); }
        if ($status = $request->input('status')) { $query->where('status', $status); }
        if ($request->boolean('fake_only')) { $query->where('is_fake', true); } elseif ($request->boolean('real_only')) { $query->where('is_fake', false); }
        $devices = $query->orderBy('updated_at', 'desc')
            ->orderBy('device_id', 'asc')
            ->paginate($request->input('per_page', 10));
        return response()->json(['success' => true, 'data' => CoreDeviceResource::collection($devices), 'meta' => ['total' => $devices->total(), 'per_page' => $devices->perPage(), 'current_page' => $devices->currentPage(), 'last_page' => $devices->lastPage()]]);
    }

    public function show(string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('view', $device); return response()->json(['success' => true, 'data' => new CoreDeviceResource($device)]); }
    public function listForDropdown(Request $request) { $query = SmartLightDevice::query(); if (!Auth::user()?->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) { $query->where('user_id', Auth::id()); } $devices = $query->select('device_id as id', 'name as label', 'status', 'is_fake')->orderBy('name')->get(); return response()->json(['success' => true, 'data' => $devices]); }

    public function updateStatus(Request $request, string $device_id) { $validated = $request->validate(['status' => 'required|in:ON,OFF,SLEEPING', 'intensity' => 'nullable|integer|min:0|max:100']); $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('update', $device); $device->update(['status' => $validated['status']] + (isset($validated['intensity']) ? ['intensity' => $validated['intensity']] : [])); Cache::put("cmd_{$device_id}", ['command' => 'STATUS_UPDATE', 'status' => $validated['status'], 'intensity' => $validated['intensity'] ?? null, 'timestamp' => now()->timestamp], 120); event(new DeviceCommandSent($device_id, 'STATUS_UPDATE', ['status' => $validated['status'], 'intensity' => $validated['intensity'] ?? null])); return response()->json(['success' => true, 'message' => 'Статус обновлён', 'data' => (new CoreDeviceResource($device))->resolve()]); }
    public function updateIntensity(Request $request, string $device_id) { $validated = $request->validate(['intensity' => 'required|integer|min:0|max:100']); $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('update', $device); $device->update(['intensity' => $validated['intensity']]); Cache::put("cmd_{$device_id}", ['command' => 'SET_INTENSITY', 'intensity' => $validated['intensity'], 'timestamp' => now()->timestamp], 120); event(new DeviceCommandSent($device_id, 'SET_INTENSITY', ['intensity' => $validated['intensity']])); return response()->json(['success' => true, 'message' => 'Интенсивность обновлена', 'data' => (new CoreDeviceResource($device))->resolve()]); }
    public function forceSleep(Request $request, string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('update', $device); $this->deviceService->forceSleep($device); Cache::put("cmd_{$device_id}", ['command' => 'EMERGENCY_SLEEP', 'timestamp' => now()->timestamp], 120); event(new DeviceCommandSent($device_id, 'EMERGENCY_SLEEP')); return response()->json(['success' => true, 'message' => 'Команда сна отправлена', 'data' => ['device_id' => $device_id, 'status' => $device->status]]); }
    public function wakeDevice(Request $request, string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('update', $device); $this->deviceService->wakeDevice($device); Cache::put("cmd_{$device_id}", ['command' => 'WAKE_UP', 'timestamp' => now()->timestamp], 120); event(new DeviceCommandSent($device_id, 'WAKE_UP', 100)); return response()->json(['success' => true, 'message' => 'Устройство пробуждено', 'data' => ['device_id' => $device_id, 'status' => $device->status]]); }

    public function getTelemetry(Request $request, string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('view', $device); $validated = $request->validate(['period' => 'nullable|in:1h,6h,24h,7d,30d', 'limit' => 'nullable|integer|min:1|max:1000']); $query = $device->telemetry(); $periods = ['1h' => now()->subHour(), '6h' => now()->subHours(6), '24h' => now()->subDay(), '7d' => now()->subWeek(), '30d' => now()->subMonth()]; if (!empty($validated['period']) && isset($periods[$validated['period']])) { $query->where('received_at', '>=', $periods[$validated['period']]); } $telemetry = $query->orderBy('received_at', 'desc')->limit($validated['limit'] ?? 100)->get(); return response()->json(['success' => true, 'data' => $telemetry]); }
    public function getBatteryStatus(string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('view', $device); return response()->json(['success' => true, 'data' => ['device_id' => $device->device_id, 'voltage' => $device->voltage, 'critical_voltage' => $device->critical_voltage, 'battery_progress' => $device->battery_progress, 'voltage_color' => $device->voltage_color, 'is_critical' => $device->isBatteryCritical()]]); }
    public function getPowerStatus(string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('view', $device); return response()->json(['success' => true, 'data' => ['device_id' => $device->device_id, 'status' => $device->status, 'intensity' => $device->intensity, 'estimated_runtime' => $device->estimated_runtime]]); }

    public function register(Request $request) { $validated = $request->validate(['mac_address' => 'required|string', 'device_type' => 'required|string|in:node_mcu_v3,esp32,esp8266,custom', 'name' => 'nullable|string|max:255', 'battery_type_id' => 'nullable|string|exists:smart_light_battery_types,id', 'bulb_type_id' => 'nullable|string|exists:smart_light_bulb_types,id', 'power_supply_id' => 'nullable|string|exists:smart_light_power_supplies,id']); $device = SmartLightDevice::create(['user_id' => Auth::id(), 'name' => $validated['name'] ?? 'Светильник ' . Str::upper(Str::random(4)), 'device_id' => 'LIGHT_' . Str::upper(Str::random(8)), 'device_type' => $validated['device_type'], 'battery_type_id' => $validated['battery_type_id'] ?? 'li-ion-18650', 'bulb_type_id' => $validated['bulb_type_id'] ?? 'classic', 'power_supply_id' => $validated['power_supply_id'] ?? 'standard', 'battery_capacity' => 2000, 'critical_voltage' => 3.2, 'sleep_interval' => 600, 'emergency_sleep_interval' => 3600, 'status' => 'OFF', 'voltage' => 3.7, 'intensity' => 0, 'api_key' => Str::random(32), 'settings' => ['server_url' => config('app.url') . '/api/smart-light'], 'is_fake' => false, 'battery_group_config' => null]); Log::info('Device registered', ['device_id' => $device->device_id]); return response()->json(['success' => true, 'message' => 'Устройство зарегистрировано', 'data' => ['device_id' => $device->device_id, 'api_key' => $device->api_key]], 201); }

    public function destroy(string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $this->authorize('delete', $device); $device->telemetry()->delete(); $device->delete(); Cache::forget("cmd_{$device_id}"); Log::info('Device soft-deleted', ['device_id' => $device_id]); return response()->json(['success' => true, 'message' => 'Устройство удалено']); }

    public function getLegacySettings(Request $request, string $device_id) { $device = $request->device; return response()->json(['success' => true, 'data' => ['server_url' => $device->settings['server_url'] ?? config('app.url') . '/api/smart-light', 'critical_voltage' => $device->critical_voltage, 'sleep_interval' => $device->sleep_interval, 'emergency_sleep_interval' => $device->emergency_sleep_interval, 'power_config' => ['controller_runtime' => 86400, 'min_controller_voltage' => 2.8]]]); }
    public function checkOwnership(Request $request, string $device_id) { $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail(); $user = $request->user(); $owns = ($user && $device->user_id === $user->id) || $user?->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT); return response()->json(['success' => true, 'owns_device' => $owns, 'device_id' => $device_id]); }
}
