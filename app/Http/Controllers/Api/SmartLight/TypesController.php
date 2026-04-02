<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;

class TypesController extends Controller
{
    public function batteryTypes()
    {
        $types = [
            'li-ion-18650' => [
                'id' => 'li-ion-18650',
                'name' => 'Li-ion 18650',
                'min_voltage' => 2.5,
                'max_voltage' => 4.2,
                'critical_voltage' => 3.0,
                'nominal_capacity' => 3500
            ],
            'li-ion-21700' => [
                'id' => 'li-ion-21700',
                'name' => 'Li-ion 21700',
                'min_voltage' => 2.5,
                'max_voltage' => 4.2,
                'critical_voltage' => 3.0,
                'nominal_capacity' => 5000
            ],
            'li-po' => [
                'id' => 'li-po',
                'name' => 'Li-Po',
                'min_voltage' => 2.8,
                'max_voltage' => 4.35,
                'critical_voltage' => 3.2,
                'nominal_capacity' => 2500
            ],
            'lead-acid' => [
                'id' => 'lead-acid',
                'name' => 'Свинцово-кислотный',
                'min_voltage' => 10.5,
                'max_voltage' => 14.4,
                'critical_voltage' => 11.0,
                'nominal_capacity' => 50000
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    public function bulbTypes()
    {
        $types = [
            'classic' => [
                'id' => 'classic',
                'name' => 'Классическая',
                'category' => 'incandescent',
                'light_efficiency' => 10,
                'color_temperature' => 2700,
                'lifespan' => 1000
            ],
            'led' => [
                'id' => 'led',
                'name' => 'LED',
                'category' => 'led',
                'light_efficiency' => 80,
                'color_temperature' => 4000,
                'lifespan' => 25000
            ],
            'halogen' => [
                'id' => 'halogen',
                'name' => 'Галогенная',
                'category' => 'halogen',
                'light_efficiency' => 15,
                'color_temperature' => 3000,
                'lifespan' => 2000
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    public function powerSupplies()
    {
        $types = [
            'standard' => [
                'id' => 'standard',
                'name' => 'Стандартный источник',
                'category' => 'standard',
                'voltage_range' => ['min' => 2.5, 'max' => 4.3],
                'current_range' => ['min' => 0, 'max' => 1000]
            ],
            'solar' => [
                'id' => 'solar',
                'name' => 'Солнечная панель',
                'category' => 'renewable',
                'voltage_range' => ['min' => 2.5, 'max' => 6.0],
                'current_range' => ['min' => 0, 'max' => 500]
            ],
            'grid' => [
                'id' => 'grid',
                'name' => 'Сеть',
                'category' => 'grid',
                'voltage_range' => ['min' => 2.5, 'max' => 4.3],
                'current_range' => ['min' => 0, 'max' => 1000]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
}
