<?php

namespace App\Http\Controllers\Api\SmartLight\V0;

use App\Http\Controllers\Api\SmartLight\Core\CoreTelemetryController;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class V0TelemetryController extends CoreTelemetryController
{
    /**
     * V0: История телеметрии (упрощённый формат)
     */
    public function index(Request $request, $device_id): JsonResponse
    {
        $response = parent::index($request, $device_id);
        $data = $response->getData(true);

        // V0: возвращаем только массив записей
        if (isset($data['data'])) {
            return response()->json([
                'version' => 'v0',
                'device_id' => $device_id,
                'telemetry' => $data['data']
            ]);
        }

        return $response;
    }
}
