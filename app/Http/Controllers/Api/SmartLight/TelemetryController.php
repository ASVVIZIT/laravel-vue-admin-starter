<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\Telemetry;
use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    public function store(Request $request, $device_id)
    {
        $device = $request->device;

        $request->validate([
            'voltage' => 'required|numeric|min:2.5|max:4.3',
            'status' => 'required|in:ON,OFF,LOW_POWER,SLEEPING',
            'intensity' => 'nullable|integer|min:0|max:100',
            'emergency' => 'nullable|boolean'
        ]);

        // Обновляем напряжение в основном устройстве
        $device->update([
            'voltage' => $request->voltage,
            'status' => $request->status
        ]);

        // Создаём запись телеметрии
        $telemetry = Telemetry::create([
            'device_id' => $device->id,
            'voltage' => $request->voltage,
            'status' => $request->status,
            'intensity' => $request->intensity ?? 100,
            'is_emergency' => $request->emergency ?? false,
            'received_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'telemetry_id' => $telemetry->id,
            'device_id' => $device_id,
            'estimated_runtime' => $device->estimated_runtime
        ]);
    }

    public function index(Request $request, $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

        // Проверка прав доступа
        if (!$request->user()->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT) &&
            $device->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $telemetry = $device->telemetry()
            ->orderBy('received_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($telemetry);
    }
}
