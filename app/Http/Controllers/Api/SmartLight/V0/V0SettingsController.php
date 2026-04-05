<?php

namespace App\Http\Controllers\Api\SmartLight\V0;

use App\Http\Controllers\Api\SmartLight\Core\CoreSettingsController;
use Illuminate\Http\JsonResponse;

class V0SettingsController extends CoreSettingsController
{
    /**
     * V0: Глобальные настройки (плоский ответ)
     */
    public function index($request): JsonResponse
    {
        $response = parent::index($request);
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
}
