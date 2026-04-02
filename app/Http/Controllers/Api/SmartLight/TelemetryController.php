<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\Telemetry;
use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\TelemetryService;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    public function __construct(
        private TelemetryService $telemetryService
    ) {}

    /**
     * Store telemetry data
     */
    public function store(Request $request, $device_id)
    {
        $device = $request->device;

        $request->validate([
            'voltage' => 'required|numeric|min:2.5|max:4.3',
            'status' => 'required|in:ON,OFF,LOW_POWER,SLEEPING',
            'intensity' => 'nullable|integer|min:0|max:100',
            'emergency' => 'nullable|boolean'
        ]);

        $telemetry = $this->telemetryService->createTelemetry($device, [
            'voltage' => $request->voltage,
            'status' => $request->status,
            'intensity' => $request->intensity ?? 100,
            'emergency' => $request->emergency ?? false
        ]);

        return response()->json([
            'success' => true,
            'telemetry_id' => $telemetry->id,
            'device_id' => $device_id,
            'estimated_runtime' => $device->estimated_runtime
        ]);
    }

    /**
     * Get telemetry history
     */
    public function index(Request $request, $device_id)
    {
        $device = SmartLightDevice::where('device_id', $device_id)->firstOrFail();

        if (!$request->user()->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT) &&
            $device->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized'
            ], 403);
        }

        $telemetry = $this->telemetryService->getTelemetryHistory($device, 100);

        return response()->json([
            'success' => true,
            'data' => $telemetry
        ]);
    }

    /**
     * V1 API: Get telemetry
     */
    public function apiIndex(Request $request, $device_id)
    {
        return $this->index($request, $device_id);
    }

    /**
     * V1 API: Store telemetry
     */
    public function apiStore(Request $request, $device_id)
    {
        return $this->store($request, $device_id);
    }
}
