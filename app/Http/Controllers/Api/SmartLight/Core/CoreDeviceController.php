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
    /**
     * Constructor with dependency injection.
     */
    public function __construct(private DeviceService $deviceService)
    {
        //
    }

    /**
     * Get all devices with pagination.
     *
     * GET /smart-light/devices
     */
    public function index(Request $request)
    {
        $query = SmartLightDevice::with(['batteryType', 'bulbType', 'powerSupply']);

        // Фильтрация по правам доступа
        if (!Auth::user()?->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            $query->where('user_id', Auth::id());
        }

        // Поиск по имени или device_id
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('device_id', 'like', "%{$search}%");
            });
        }

        // Фильтр по статусу
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Фильтр по типу: только фейковые или только реальные
        if ($request->boolean('fake_only')) {
            $query->where('is_fake', true);
        } elseif ($request->boolean('real_only')) {
            $query->where('is_fake', false);
        }

        // ✅ СТАБИЛЬНАЯ СОРТИРОВКА: сначала по is_fake, потом по device_id
        $devices = $query
            ->orderBy('is_fake', 'asc')
            ->orderBy('device_id', 'asc')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => CoreDeviceResource::collection($devices),
            'meta' => [
                'total' => $devices->total(),
                'per_page' => $devices->perPage(),
                'current_page' => $devices->currentPage(),
                'last_page' => $devices->lastPage(),
            ],
        ], 200);
    }

    /**
     * Get single device by device_id.
     *
     * GET /smart-light/devices/{device_id}
     */
    public function show(string $device_id)
    {
        $device = SmartLightDevice::with(['batteryType', 'bulbType', 'powerSupply'])
            ->where('device_id', $device_id)
            ->firstOrFail();

        $this->authorize('view', $device);

        return response()->json([
            'success' => true,
            'data' => new CoreDeviceResource($device),
        ], 200);
    }

    /**
     * Get devices for dropdown selection.
     *
     * GET /smart-light/devices/dropdown
     */
    public function listForDropdown(Request $request)
    {
        $query = SmartLightDevice::query();

        if (!Auth::user()?->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            $query->where('user_id', Auth::id());
        }

        $devices = $query
            ->select('device_id as id', 'name as label', 'status', 'is_fake')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $devices,
        ], 200);
    }

    /**
     * Update device status.
     *
     * PUT /smart-light/devices/{device_id}/status
     */
    public function updateStatus(Request $request, string $device_id)
    {
        $validated = $request->validate([
            'status' => 'required|in:ON,OFF,SLEEPING',
            'intensity' => 'nullable|integer|min:0|max:100',
        ]);

        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        $updateData = ['status' => $validated['status']];

        if (isset($validated['intensity'])) {
            $updateData['intensity'] = (int) $validated['intensity'];
        }

        $device->update($updateData);

        // ✅ ИСПРАВЛЕНО: передаём $intensity как int, а не массив
        $intensityValue = isset($validated['intensity']) ? (int) $validated['intensity'] : 0;

        Cache::put("cmd_{$device_id}", [
            'command' => 'STATUS_UPDATE',
            'status' => $validated['status'],
            'intensity' => $intensityValue,
            'timestamp' => now()->timestamp,
        ], 120);

        // ✅ ИСПРАВЛЕНО: передаём $intensityValue как int (не массив)
        event(new DeviceCommandSent($device_id, 'STATUS_UPDATE', $intensityValue));

        // ✅ Загружаем отношения для корректного ответа ресурса
        $device->load(['batteryType', 'bulbType', 'powerSupply']);

        return response()->json([
            'success' => true,
            'message' => 'Статус обновлён',
            'data' => (new CoreDeviceResource($device))->resolve(),
        ], 200);
    }

    /**
     * Update device intensity only.
     *
     * PUT /smart-light/devices/{device_id}/intensity
     */
    public function updateIntensity(Request $request, string $device_id)
    {
        $validated = $request->validate([
            'intensity' => 'required|integer|min:0|max:100',
        ]);

        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        $device->update(['intensity' => (int) $validated['intensity']]);

        Cache::put("cmd_{$device_id}", [
            'command' => 'SET_INTENSITY',
            'intensity' => (int) $validated['intensity'],
            'timestamp' => now()->timestamp,
        ], 120);

        event(new DeviceCommandSent($device_id, 'SET_INTENSITY', (int) $validated['intensity']));

        // ✅ Загружаем отношения для корректного ответа ресурса
        $device->load(['batteryType', 'bulbType', 'powerSupply']);

        return response()->json([
            'success' => true,
            'message' => 'Интенсивность обновлена',
            'data' => (new CoreDeviceResource($device))->resolve(),
        ], 200);
    }

    /**
     * Force sleep device (emergency).
     *
     * POST /smart-light/devices/{device_id}/sleep
     */
    public function forceSleep(Request $request, string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        $this->deviceService->forceSleep($device);

        Cache::put("cmd_{$device_id}", [
            'command' => 'EMERGENCY_SLEEP',
            'timestamp' => now()->timestamp,
        ], 120);

        event(new DeviceCommandSent($device_id, 'EMERGENCY_SLEEP', 0));

        return response()->json([
            'success' => true,
            'message' => 'Команда сна отправлена',
            'data' => [
                'device_id' => $device_id,
                'status' => $device->status,
            ],
        ], 200);
    }

    /**
     * Wake up device.
     *
     * POST /smart-light/devices/{device_id}/wake
     */
    public function wakeDevice(Request $request, string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        $this->deviceService->wakeDevice($device);

        Cache::put("cmd_{$device_id}", [
            'command' => 'WAKE_UP',
            'timestamp' => now()->timestamp,
        ], 120);

        event(new DeviceCommandSent($device_id, 'WAKE_UP', 100));

        return response()->json([
            'success' => true,
            'message' => 'Устройство пробуждено',
            'data' => [
                'device_id' => $device_id,
                'status' => $device->status,
            ],
        ], 200);
    }

    /**
     * Get device telemetry history.
     *
     * GET /smart-light/devices/{device_id}/telemetry
     */
    public function getTelemetry(Request $request, string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        $validated = $request->validate([
            'period' => 'nullable|in:1h,6h,24h,7d,30d',
            'limit' => 'nullable|integer|min:1|max:1000',
        ]);

        $query = $device->telemetry();

        $periods = [
            '1h' => now()->subHour(),
            '6h' => now()->subHours(6),
            '24h' => now()->subDay(),
            '7d' => now()->subWeek(),
            '30d' => now()->subMonth(),
        ];

        if (!empty($validated['period']) && isset($periods[$validated['period']])) {
            $query->where('received_at', '>=', $periods[$validated['period']]);
        }

        $telemetry = $query
            ->orderBy('received_at', 'desc')
            ->limit($validated['limit'] ?? 100)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $telemetry,
        ], 200);
    }

    /**
     * Get battery status summary.
     *
     * GET /smart-light/devices/{device_id}/battery
     */
    public function getBatteryStatus(string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        return response()->json([
            'success' => true,
            'data' => [
                'device_id' => $device->device_id,
                'voltage' => $device->voltage,
                'critical_voltage' => $device->critical_voltage,
                'battery_progress' => $device->battery_progress,
                'voltage_color' => $device->voltage_color,
                'is_critical' => $device->isBatteryCritical(),
            ],
        ], 200);
    }

    /**
     * Get power status summary.
     *
     * GET /smart-light/devices/{device_id}/power
     */
    public function getPowerStatus(string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        return response()->json([
            'success' => true,
            'data' => [
                'device_id' => $device->device_id,
                'status' => $device->status,
                'intensity' => $device->intensity,
                'estimated_runtime' => $device->estimated_runtime,
            ],
        ], 200);
    }

    /**
     * Register new device.
     *
     * POST /smart-light/devices/register
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'mac_address' => 'required|string',
            'device_type' => 'required|string|in:node_mcu_v3,esp32,esp8266,custom',
            'name' => 'nullable|string|max:255',
            'battery_type_id' => 'nullable|string|exists:smart_light_battery_types,id',
            'bulb_type_id' => 'nullable|string|exists:smart_light_bulb_types,id',
            'power_supply_id' => 'nullable|string|exists:smart_light_power_supplies,id',
        ]);

        $device = SmartLightDevice::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'] ?? 'Светильник ' . Str::upper(Str::random(4)),
            'device_id' => 'LIGHT_' . Str::upper(Str::random(8)),
            'device_type' => $validated['device_type'],
            'battery_type_id' => $validated['battery_type_id'] ?? 'li-ion-18650',
            'bulb_type_id' => $validated['bulb_type_id'] ?? 'classic',
            'power_supply_id' => $validated['power_supply_id'] ?? 'standard',
            'battery_capacity' => 2000,
            'critical_voltage' => 3.2,
            'sleep_interval' => 600,
            'emergency_sleep_interval' => 3600,
            'status' => 'OFF',
            'voltage' => 3.7,
            'intensity' => 0,
            'api_key' => Str::random(32),
            'settings' => ['server_url' => config('app.url') . '/api/smart-light'],
            'is_fake' => false,
            'battery_group_config' => null,
        ]);

        Log::info('Device registered', ['device_id' => $device->device_id]);

        return response()->json([
            'success' => true,
            'message' => 'Устройство зарегистрировано',
            'data' => [
                'device_id' => $device->device_id,
                'api_key' => $device->api_key,
            ],
        ], 201);
    }

    /**
     * Delete device (soft delete).
     *
     * DELETE /smart-light/devices/{device_id}
     */
    public function destroy(string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('delete', $device);

        $device->telemetry()->delete();
        $device->delete();

        Cache::forget("cmd_{$device_id}");

        Log::info('Device soft-deleted', ['device_id' => $device_id]);

        return response()->json([
            'success' => true,
            'message' => 'Устройство удалено',
        ], 200);
    }

    /**
     * Update device settings (battery, bulb, power supply types + intervals).
     *
     * PUT /smart-light/devices/{device_id}/settings
     */
    public function updateSettings(Request $request, string $device_id)
    {
        $validated = $request->validate([
            // Прямые поля БД
            'critical_voltage' => 'nullable|numeric|min:2.0|max:5.0',
            'sleep_interval' => 'nullable|integer|min:60|max:86400',
            'emergency_sleep_interval' => 'nullable|integer|min:300|max:86400',
            'battery_type_id' => 'nullable|string|exists:smart_light_battery_types,id',
            'bulb_type_id' => 'nullable|string|exists:smart_light_bulb_types,id',
            'power_supply_id' => 'nullable|string|exists:smart_light_power_supplies,id',

            // JSON: группировка батарей
            'battery_group_config' => 'nullable|array',
            'battery_group_config.enabled' => 'nullable|boolean',
            'battery_group_config.type' => 'nullable|in:series,parallel,series_parallel',
            'battery_group_config.count' => 'nullable|integer|min:1|max:15',

            // JSON: дополнительные настройки
            'settings' => 'nullable|array',
            'settings.custom_consumption_mA' => 'nullable|integer|min:1|max:1000',
            'settings.power_management_mode' => 'nullable|in:conservative,balanced,aggressive',
            'settings.server_url' => 'nullable|url',
        ]);

        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('update', $device);

        // 1. Обновляем прямые поля БД
        $device->update([
            'critical_voltage' => $validated['critical_voltage'] ?? $device->critical_voltage,
            'sleep_interval' => $validated['sleep_interval'] ?? $device->sleep_interval,
            'emergency_sleep_interval' => $validated['emergency_sleep_interval'] ?? $device->emergency_sleep_interval,
            'battery_type_id' => $validated['battery_type_id'] ?? $device->battery_type_id,
            'bulb_type_id' => $validated['bulb_type_id'] ?? $device->bulb_type_id,
            'power_supply_id' => $validated['power_supply_id'] ?? $device->power_supply_id,
            'battery_group_config' => $validated['battery_group_config'] ?? $device->battery_group_config,
            'settings_updated_at' => now(),
        ]);

        // 2. Обновляем JSON-настройки (если переданы)
        if (!empty($validated['settings']) && is_array($validated['settings'])) {
            $currentSettings = is_array($device->settings) ? $device->settings : [];
            $updatedSettings = array_merge($currentSettings, $validated['settings']);
            $device->settings = $updatedSettings;
            $device->save();
        }

        // ✅ Загружаем отношения для корректного ответа ресурса
        $device->load(['batteryType', 'bulbType', 'powerSupply']);

        Log::info('Device settings updated', [
            'device_id' => $device_id,
            'updated_fields' => array_keys($validated)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Настройки обновлены',
            'data' => (new CoreDeviceResource($device))->resolve(),
        ], 200);
    }

    /**
     * Get legacy settings for device polling.
     *
     * GET /smart-light/devices/{device_id}/settings (legacy)
     */
    public function getLegacySettings(Request $request, string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        return response()->json([
            'success' => true,
            'data' => [
                'server_url' => (is_array($device->settings) ? $device->settings['server_url'] : null) ?? config('app.url') . '/api/smart-light',
                'critical_voltage' => $device->critical_voltage,
                'sleep_interval' => $device->sleep_interval,
                'emergency_sleep_interval' => $device->emergency_sleep_interval,
                'power_config' => [
                    'controller_runtime' => 86400,
                    'min_controller_voltage' => 2.8,
                ],
            ],
        ], 200);
    }

    /**
     * Check device ownership.
     *
     * GET /smart-light/devices/{device_id}/ownership
     */
    public function checkOwnership(Request $request, string $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $user = $request->user();

        $owns = ($user && $device->user_id === $user->id) ||
            $user?->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT);

        return response()->json([
            'success' => true,
            'owns_device' => $owns,
            'device_id' => $device_id,
        ], 200);
    }
}
