<?php

namespace App\Http\Controllers\Api\SmartLight\V1;

use App\Http\Controllers\Api\SmartLight\Core\CoreTypesController;
use Illuminate\Http\JsonResponse;

class V1TypesController extends CoreTypesController
{
    /**
     * V1: Типы батарей (как REST ресурс)
     */
    public function batteryTypes(): JsonResponse
    {
        $response = parent::batteryTypes();
        $data = $response->getData(true);

        // V1: преобразуем объект в массив ресурсов
        $types = collect($data['data'] ?? [])->map(function($type, $id) {
            return [
                'type' => 'battery-type',
                'id' => $id,
                'attributes' => [
                    'name' => $type['name'],
                    'chemistry' => $this->guessChemistry($id),
                    'specs' => [
                        'min_voltage' => $type['min_voltage'],
                        'max_voltage' => $type['max_voltage'],
                        'critical_voltage' => $type['critical_voltage'],
                        'nominal_capacity_mah' => $type['nominal_capacity'] ?? null
                    ]
                ],
                'links' => [
                    'self' => route('smart-light.v1.battery-types.show', $id)
                ]
            ];
        })->values();

        return response()->json([
            'data' => $types,
            'meta' => ['count' => $types->count()],
            'api_version' => '1.0.0'
        ]);
    }

    /**
     * V1: Типы ламп
     */
    public function bulbTypes(): JsonResponse
    {
        $response = parent::bulbTypes();
        $data = $response->getData(true);

        $types = collect($data['data'] ?? [])->map(function($type, $id) {
            return [
                'type' => 'bulb-type',
                'id' => $id,
                'attributes' => [
                    'name' => $type['name'],
                    'category' => $type['category'] ?? 'unknown',
                    'specs' => [
                        'light_efficiency_lm_w' => $type['light_efficiency'] ?? null,
                        'color_temperature_k' => $type['color_temperature'] ?? null,
                        'lifespan_hours' => $type['lifespan'] ?? null
                    ]
                ],
                'links' => [
                    'self' => route('smart-light.v1.bulb-types.show', $id)
                ]
            ];
        })->values();

        return response()->json([
            'data' => $types,
            'meta' => ['count' => $types->count()],
            'api_version' => '1.0.0'
        ]);
    }

    /**
     * V1: Источники питания
     */
    public function powerSupplies(): JsonResponse
    {
        $response = parent::powerSupplies();
        $data = $response->getData(true);

        $types = collect($data['data'] ?? [])->map(function($type, $id) {
            return [
                'type' => 'power-supply',
                'id' => $id,
                'attributes' => [
                    'name' => $type['name'],
                    'category' => $type['category'] ?? 'unknown',
                    'specs' => [
                        'voltage_range' => $type['voltage_range'] ?? [],
                        'current_range' => $type['current_range'] ?? []
                    ]
                ],
                'links' => [
                    'self' => route('smart-light.v1.power-supplies.show', $id)
                ]
            ];
        })->values();

        return response()->json([
            'data' => $types,
            'meta' => ['count' => $types->count()],
            'api_version' => '1.0.0'
        ]);
    }

    /**
     * V1: Детали типа батареи
     */
    public function showBatteryType($id): JsonResponse
    {
        $response = parent::batteryTypes();
        $data = $response->getData(true);
        $type = $data['data'][$id] ?? null;

        if (!$type) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json([
            'data' => [
                'type' => 'battery-type',
                'id' => $id,
                'attributes' => [
                    'name' => $type['name'],
                    'chemistry' => $this->guessChemistry($id),
                    'specs' => [
                        'min_voltage' => $type['min_voltage'],
                        'max_voltage' => $type['max_voltage'],
                        'critical_voltage' => $type['critical_voltage'],
                        'nominal_capacity_mah' => $type['nominal_capacity'] ?? null
                    ]
                ],
                'links' => [
                    'self' => route('smart-light.v1.battery-types.show', $id)
                ]
            ],
            'api_version' => '1.0.0'
        ]);
    }

    /**
     * Угадать химию батареи по ID
     */
    private function guessChemistry($id): ?string
    {
        return match(true) {
            str_starts_with($id, 'li-ion') => 'lithium-ion',
            str_starts_with($id, 'li-po') => 'lithium-polymer',
            str_starts_with($id, 'lead') => 'lead-acid',
            default => null
        };
    }
}
