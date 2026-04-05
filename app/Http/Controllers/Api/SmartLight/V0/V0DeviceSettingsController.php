<?php

namespace App\Http\Controllers\Api\SmartLight\V0;

use App\Http\Controllers\Api\SmartLight\Core\CoreDeviceSettingsController;
use Illuminate\Http\JsonResponse;

class V0DeviceSettingsController extends CoreDeviceSettingsController
{
    /**
     * V0: Показать настройки (упрощённый формат)
     */
    public function show($device_id): JsonResponse
    {
        $response = parent::show($device_id);
        $data = $response->getData(true);

        // V0: возвращаем настройки напрямую
        if (isset($data['data'])) {
            return response()->json([
                'version' => 'v0',
                ...$data['data']
            ]);
        }

        return $response;
    }

    /**
     * V0: Обновить настройки (старая валидация)
     */
    public function update($request, $device_id): JsonResponse
    {
        // V0: более мягкая валидация
        $request->merge([
            'critical_voltage' => $request->input('critical_voltage') ?
                min(4.3, max(2.5, floatval($request->input('critical_voltage')))) : null
        ]);

        return parent::update($request, $device_id);
    }
}
