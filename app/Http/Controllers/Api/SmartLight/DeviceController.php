<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\GlobalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use App\Events\SmartLight\DeviceCommandSent;

class DeviceController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SmartLightDevice::class, 'device');
    }

    public function register(Request $request)
    {
        $request->validate([
            'mac_address' => 'required|string',
            'device_type' => 'required|string'
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

    public function getSettings(Request $request, $device_id)
    {
        $device = $request->device;

        return response()->json([
            'server_url' => $device->settings['server_url'] ?? GlobalSetting::get('global_server_url', config('app.url') . '/api/smart-light'),
            'critical_voltage' => $device->critical_voltage,
            'sleep_interval' => $device->sleep_interval,
            'emergency_sleep_interval' => $device->emergency_sleep_interval,
            'app_host' => config('app.host') ?? parse_url(config('app.url'), PHP_URL_HOST),
            'device_type' => $device->device_type,
            'power_config' => [
                'shared_power_source' => true, // Общий источник питания для модуля и лампы
                'controller_runtime' => 24 * 60 * 60, // 24 часа автономной работы контроллера при отключенной нагрузке
                'min_controller_voltage' => 2.8, // Минимальное напряжение для работы модуля
                'power_management_mode' => 'conservative' // Режим управления питанием
            ]
        ]);
    }

    public function forceSleep(Request $request, $device_id)
    {
        $device = $request->device;

        // Обновляем статус устройства
        $device->update([
            'status' => 'SLEEPING'
        ]);

        // Отправляем команду в кеш
        Cache::put("cmd_{$device_id}", [
            'command' => 'EMERGENCY_SLEEP',
            'timestamp' => now()->timestamp
        ], 120); // Команда живёт 2 минуты

        // Отправка события через Reverb
        event(new DeviceCommandSent($device_id, 'EMERGENCY_SLEEP'));

        return response()->json([
            'success' => true,
            'message' => 'Команда сна отправлена',
            'device_id' => $device_id,
            'sleep_interval' => $device->emergency_sleep_interval
        ]);
    }

    public function checkOwnership(Request $request, $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $user = $request->user();
        $ownsDevice = ($user && $device->user_id === $user->id) ||
            ($user && $user->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT));

        return response()->json([
            'owns_device' => $ownsDevice,
            'device_id' => $device_id,
            'user_id' => $user ? $user->id : null,
            'device_owner_id' => $device->user_id,
            'user_can_manage_all' => $user ? $user->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT) : false
        ]);
    }

    public function index(Request $request)
    {
        $query = SmartLightDevice::query();

        // Фильтр по пользователю (только свои устройства)
        if (!$request->user()->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            $query->where('user_id', $request->user()->id);
        }

        // Поиск
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('device_id', 'like', "%{$search}%");
        }

        // Пагинация
        $perPage = $request->input('per_page', 10);
        $devices = $query->paginate($perPage);

        return response()->json([
            'data' => $devices->items(),
            'meta' => [
                'total' => $devices->total(),
                'per_page' => $devices->perPage(),
                'current_page' => $devices->currentPage(),
                'last_page' => $devices->lastPage()
            ]
        ]);
    }

    public function listForDropdown(Request $request)
    {
        $query = SmartLightDevice::query();

        // Только свои устройства для обычных пользователей
        if (!$request->user()->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            $query->where('user_id', $request->user()->id);
        }

        $devices = $query->select('id', 'device_id as id', 'name as label')
            ->get();

        return response()->json(['data' => $devices]);
    }
}
