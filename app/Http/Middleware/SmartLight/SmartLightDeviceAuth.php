<?php

namespace App\Http\Middleware\SmartLight;

use Closure;
use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SmartLightDeviceAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $device_id = $request->route('device_id');
        $api_key = $request->header('X-Device-Key');

        if (!$device_id || !$api_key) {
            return response()->json([
                'error' => 'Missing required headers',
                'message' => 'X-Device-Key header is required'
            ], 400);
        }

        $device = SmartLightDevice::where('device_id', $device_id)
            ->where('api_key', $api_key)
            ->first();

        if (!$device) {
            return response()->json([
                'error' => 'Unauthorized device',
                'message' => 'Device ID or API key is invalid'
            ], 401);
        }

        // Проверка критического напряжения
        if ($device->voltage < $device->critical_voltage) {
            return response()->json([
                'error' => 'Critical voltage',
                'message' => 'Device is in emergency mode due to low battery',
                'current_voltage' => $device->voltage,
                'critical_voltage' => $device->critical_voltage,
                'estimated_runtime' => $device->estimated_runtime
            ], 428);
        }

        $request->merge(['device' => $device]);

        return $next($request);
    }
}
