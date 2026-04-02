<?php

namespace App\Http\Controllers\Api\SmartLight\V0;

use App\Http\Controllers\Api\SmartLight\Core\CoreDeviceController;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class V0DeviceController extends CoreDeviceController
{
    /**
     * V0: Display a listing (default behavior)
     */
    public function index(Request $request): JsonResponse
    {
        $response = parent::index($request);

        $data = $response->getData(true);
        $data['version'] = 'v0';
        $data['api_info'] = [
            'version' => '0.1.0',
            'documentation' => '/api/docs/v0',
            'deprecated' => false
        ];

        return response()->json($data);
    }

    /**
     * V0: Show device with telemetry
     */
    public function showWithTelemetry($device_id): JsonResponse
    {
        $device = \App\Models\SmartLight\SmartLightDevice::where('device_id', $device_id)->firstOrFail();

        $this->authorize('view', $device);

        $telemetry = $device->telemetry()
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json([
            'success' => true,
            'version' => 'v0',
            'data' => [
                'device' => new \App\Http\Resources\SmartLight\V0\V0DeviceResource($device),
                'telemetry' => \App\Http\Resources\SmartLight\V0\V0TelemetryResource::collection($telemetry)
            ]
        ]);
    }
}
