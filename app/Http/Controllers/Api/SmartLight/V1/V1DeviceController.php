<?php

namespace App\Http\Controllers\Api\SmartLight\V1;

use App\Http\Controllers\Api\SmartLight\Core\CoreDeviceController;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class V1DeviceController extends CoreDeviceController
{
    /**
     * V1: Display a listing with extended data
     */
    public function index(Request $request): JsonResponse
    {
        $response = parent::index($request);

        $data = $response->getData(true);
        $data['version'] = 'v1';
        $data['api_info'] = [
            'version' => '1.0.0',
            'documentation' => '/api/docs/v1',
            'deprecated' => false,
            'new_features' => ['telemetry_included', 'extended_metadata']
        ];

        return response()->json($data);
    }

    /**
     * V1: Show device with extended telemetry
     */
    public function showWithTelemetry($device_id): JsonResponse
    {
        $device = \App\Models\SmartLight\SmartLightDevice::where('device_id', $device_id)->firstOrFail();

        $this->authorize('view', $device);

        $telemetry = $device->telemetry()
            ->orderBy('created_at', 'desc')
            ->limit(1000)  // V1: больше данных
            ->get();

        // V1: Добавляем статистику
        $stats = [
            'avg_voltage' => $telemetry->avg('voltage'),
            'min_voltage' => $telemetry->min('voltage'),
            'max_voltage' => $telemetry->max('voltage'),
            'total_records' => $telemetry->count()
        ];

        return response()->json([
            'success' => true,
            'version' => 'v1',
            'data' => [
                'device' => new \App\Http\Resources\SmartLight\V1\V1DeviceResource($device),
                'telemetry' => \App\Http\Resources\SmartLight\V1\V1TelemetryResource::collection($telemetry),
                'statistics' => $stats
            ]
        ]);
    }

    /**
     * V1: Batch operations
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'devices' => 'required|array',
            'devices.*.device_id' => 'required|string',
            'devices.*.status' => 'nullable|in:ON,OFF,SLEEPING'
        ]);

        $results = [];
        foreach ($request->devices as $deviceData) {
            $device = \App\Models\SmartLight\SmartLightDevice::where('device_id', $deviceData['device_id'])->first();
            if ($device) {
                $device->update($deviceData);
                $results[] = ['device_id' => $deviceData['device_id'], 'success' => true];
            } else {
                $results[] = ['device_id' => $deviceData['device_id'], 'success' => false, 'error' => 'Not found'];
            }
        }

        return response()->json([
            'success' => true,
            'version' => 'v1',
            'data' => ['results' => $results]
        ]);
    }
}
