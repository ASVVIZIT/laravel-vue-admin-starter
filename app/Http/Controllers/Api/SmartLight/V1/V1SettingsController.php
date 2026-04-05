<?php

namespace App\Http\Controllers\Api\SmartLight\V1;

use App\Http\Controllers\Api\SmartLight\Core\CoreSettingsController;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class V1SettingsController extends CoreSettingsController
{
    /**
     * V1: Глобальные настройки (с метаданными)
     */
    public function index(Request $request): JsonResponse
    {
        $response = parent::index($request);
        $data = $response->getData(true);

        // V1: добавляем информацию о настройках
        $data['metadata'] = [
            'last_updated' => now()->toISOString(),
            'updated_by' => $request->user()?->email ?? 'system',
            'editable_fields' => [
                'critical_voltage', 'sleep_interval', 'emergency_sleep_interval',
                'default_battery_type', 'default_bulb_type', 'power_management_mode'
            ]
        ];

        return response()->json([
            'data' => $data['data'] ?? [],
            'metadata' => $data['metadata'],
            'api_version' => '1.0.0'
        ]);
    }

    /**
     * V1: Обновление настроек (с аудитом)
     */
    public function update(Request $request): JsonResponse
    {
        $response = parent::update($request);
        $data = $response->getData(true);

        // V1: добавляем аудит изменений
        $data['audit'] = [
            'changed_by' => $request->user()?->email ?? 'system',
            'changed_at' => now()->toISOString(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ];

        return response()->json([
            'data' => $data['data'] ?? [],
            'audit' => $data['audit'],
            'api_version' => '1.0.0'
        ]);
    }
}
