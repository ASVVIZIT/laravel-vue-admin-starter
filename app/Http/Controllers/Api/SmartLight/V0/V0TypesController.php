<?php

namespace App\Http\Controllers\Api\SmartLight\V0;

use App\Http\Controllers\Api\SmartLight\Core\CoreTypesController;
use Illuminate\Http\JsonResponse;

class V0TypesController extends CoreTypesController
{
    /**
     * V0: Типы батарей (массив, не объект)
     */
    public function batteryTypes(): JsonResponse
    {
        $response = parent::batteryTypes();
        $data = $response->getData(true);

        // V0: возвращаем массив типов, не {success, data}
        if (isset($data['data']) && is_array($data['data'])) {
            return response()->json([
                'version' => 'v0',
                'types' => array_values($data['data'])
            ]);
        }

        return $response;
    }

    /**
     * V0: Типы ламп
     */
    public function bulbTypes(): JsonResponse
    {
        $response = parent::bulbTypes();
        $data = $response->getData(true);

        if (isset($data['data']) && is_array($data['data'])) {
            return response()->json([
                'version' => 'v0',
                'types' => array_values($data['data'])
            ]);
        }

        return $response;
    }

    /**
     * V0: Источники питания
     */
    public function powerSupplies(): JsonResponse
    {
        $response = parent::powerSupplies();
        $data = $response->getData(true);

        if (isset($data['data']) && is_array($data['data'])) {
            return response()->json([
                'version' => 'v0',
                'types' => array_values($data['data'])
            ]);
        }

        return $response;
    }
}
