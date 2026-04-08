<?php

namespace App\Http\Controllers\Api\SmartLight\Core;

use App\Http\Controllers\Controller;
use App\Http\Resources\SmartLight\Core\CoreDeviceResource;
use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\SmartLightUser;
use App\Services\SmartLight\DeviceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Events\SmartLight\DeviceCommandSent;

/**
 * ============================================================================
 * CORE DEVICE CONTROLLER — УПРАВЛЕНИЕ УСТРОЙСТВАМИ ОСВЕЩЕНИЯ
 * ============================================================================
 * 📁 Путь: app/Http/Controllers/Api/SmartLight/Core/CoreDeviceController.php
 * ✅ Архитектура: Логика прав делегирована в модели (SmartLightUser, SmartLightDevice)
 * ✅ Исправление: Прямая проверка прав через Auth::user()->can() (обход проблемы с кэшем)
 * ✅ Фильтрация: Явная логика для вкладок "Мои" / "Реальные" / "Фейковые"
 * ============================================================================
 */

class CoreDeviceController extends Controller
{
    /**
     * Constructor with dependency injection.
     */
    public function __construct(private DeviceService $deviceService) {}

    // ========================================================================
    // 📋 LIST & FILTER
    // ========================================================================

    /**
     * GET /smart-light/devices
     *
     * ✅ Исправлено: Прямая проверка прав, явная фильтрация по вкладке "Мои"
     */
    public function index(Request $request)
    {
        // 🔥 Сброс кэша прав (гарантирует актуальность после сидинга/изменений)
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // === 1. Базовый запрос с отношениями ===
        $query = SmartLightDevice::with(['batteryType', 'bulbType', 'powerSupply']);

        // === 2. Фильтрация по правам доступа (через скоуп модели) ===
        // ✅ Скоуп теперь использует прямую проверку прав (без создания нового экземпляра)
        $query->forSmartLightUser();

        // === 3. Дополнительные фильтры ===

        // 🔍 Поиск по имени или device_id
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('device_id', 'like', "%{$search}%");
            });
        }

        // 📊 Фильтр по статусу
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // 🎯 Фильтр по вкладке (явная логика)
        $tab = $request->input('tab', 'all');

        match ($tab) {
            // "Реальные" — только is_fake = false
            'real' => $query->where('is_fake', false),

            // "Фейковые" — только is_fake = true
            'fake' => $query->where('is_fake', true),

            // "Мои" — ТОЛЬКО устройства текущего пользователя (игнорирует права админа)
            // ✅ Это гарантирует, что в табе "Мои" пользователь видит именно свои устройства
            'personal' => $query->where('user_id', Auth::id()),

            // "Все" или неизвестное — без дополнительных фильтров
            default => null,
        };

        // === 4. Сортировка и пагинация ===
        $devices = $query
            ->orderBy('name', 'asc')
            ->orderBy('device_id', 'asc')
            ->paginate($request->input('per_page', 120));

        // === 5. Динамические вкладки на основе прав ===
        // ✅ Получаем через модель, но права проверяются через сервис (без каста)
        $tabs = SmartLightUser::current()?->getSmartLightTabs() ?? [];

        // === 6. Ответ ===
        return response()->json([
            'success' => true,
            'data' => CoreDeviceResource::collection($devices),
            'meta' => [
                'total' => $devices->total(),
                'per_page' => $devices->perPage(),
                'current_page' => $devices->currentPage(),
                'last_page' => $devices->lastPage(),
                'has_more' => $devices->hasMorePages(),
                'tabs' => $tabs, // ✅ Динамические вкладки
            ],
        ], 200);
    }

    // ========================================================================
    // 👁️ READ SINGLE
    // ========================================================================

    /**
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
     * GET /smart-light/devices/dropdown
     */
    public function listForDropdown(Request $request)
    {
        $query = SmartLightDevice::query()->forSmartLightUser();

        $devices = $query
            ->select('device_id as id', 'name as label', 'status', 'is_fake')
            ->orderBy('name')
            ->get();

        return response()->json(['success' => true, 'data' => $devices], 200);
    }

    // ========================================================================
    // ✏️ UPDATE STATE
    // ========================================================================

    /**
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
        $intensityValue = isset($validated['intensity']) ? (int) $validated['intensity'] : 0;

        Cache::put("cmd_{$device_id}", [
            'command' => 'STATUS_UPDATE',
            'status' => $validated['status'],
            'intensity' => $intensityValue,
            'timestamp' => now()->timestamp,
        ], 120);

        event(new DeviceCommandSent($device_id, 'STATUS_UPDATE', $intensityValue));
        $device->load(['batteryType', 'bulbType', 'powerSupply']);

        return response()->json([
            'success' => true,
            'message' => 'Статус обновлён',
            'data' => (new CoreDeviceResource($device))->resolve(),
        ], 200);
    }

    /**
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
        $device->load(['batteryType', 'bulbType', 'powerSupply']);

        return response()->json([
            'success' => true,
            'message' => 'Интенсивность обновлена',
            'data' => (new CoreDeviceResource($device))->resolve(),
        ], 200);
    }

    // ========================================================================
    // 😴 SLEEP / WAKE
    // ========================================================================

    /**
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
            'data' => ['device_id' => $device_id, 'status' => $device->status],
        ], 200);
    }

    /**
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
            'data' => ['device_id' => $device_id, 'status' => $device->status],
        ], 200);
    }

    // ========================================================================
    // 📊 TELEMETRY & STATUS
    // ========================================================================

    /**
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

        return response()->json(['success' => true, 'data' => $telemetry], 200);
    }

    /**
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
                'is_critical' => $device->voltage <= $device->critical_voltage,
            ],
        ], 200);
    }

    /**
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

    // ========================================================================
    // ➕ REGISTER / ❌ DELETE
    // ========================================================================

    /**
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
            'data' => ['device_id' => $device->device_id, 'api_key' => $device->api_key],
        ], 201);
    }

    /**
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

        return response()->json(['success' => true, 'message' => 'Устройство удалено'], 200);
    }

    // ========================================================================
    // ⚙️ SETTINGS
    // ========================================================================

    /**
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
            $device->settings = array_merge($currentSettings, $validated['settings']);
            $device->save();
        }

        $device->load(['batteryType', 'bulbType', 'powerSupply']);
        Log::info('Device settings updated', ['device_id' => $device_id]);

        return response()->json([
            'success' => true,
            'message' => 'Настройки обновлены',
            'data' => (new CoreDeviceResource($device))->resolve(),
        ], 200);
    }

    /**
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

    // ========================================================================
    // 🔐 OWNERSHIP CHECK
    // ========================================================================

    /**
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
