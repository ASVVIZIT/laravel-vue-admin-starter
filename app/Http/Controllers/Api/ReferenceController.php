<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\ReferenceType;
use App\Models\ReferenceItem;
use App\Http\Controllers\Controller;

class ReferenceController extends Controller
{
    /**
     * Получение списка типов справочников
     */
    public function getTypes()
    {
        return response()->json([
            'data' => [
                ['value' => 'accessory', 'label' => 'Аксессуары'],
                ['value' => 'brand', 'label' => 'Бренды'],
                ['value' => 'device_type', 'label' => 'Типы устройств']
            ]
        ])->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Получение данных справочника по типу
     */
    public function getData($type)
    {
        // В реальном приложении здесь будет загрузка данных из базы
        // Для примера возвращаем моковые данные
        switch ($type) {
            case 'accessory':
                return response()->json([
                    'data' => [
                        ['id' => 1, 'brand' => ['name' => 'ABB'], 'model' => 'SH200', 'series' => 'S200', 'name' => 'ABB SH200'],
                        ['id' => 2, 'brand' => ['name' => 'Legrand'], 'model' => 'DX 3', 'series' => 'DX3', 'name' => 'Legrand DX 3'],
                        ['id' => 3, 'brand' => ['name' => 'IEK'], 'model' => 'VA47-29', 'series' => 'VA47', 'name' => 'IEK VA47-29']
                    ]
                ]);
            case 'brand':
                return response()->json([
                    'data' => [
                        ['id' => 1, 'name' => 'ABB', 'country' => 'Швейцария'],
                        ['id' => 2, 'name' => 'Legrand', 'country' => 'Франция'],
                        ['id' => 3, 'name' => 'IEK', 'country' => 'Россия']
                    ]
                ]);
            case 'device_type':
                return response()->json([
                    'data' => [
                        ['id' => 1, 'name' => 'Автоматический выключатель', 'code' => 'ACB'],
                        ['id' => 2, 'name' => 'УЗО', 'code' => 'RCD'],
                        ['id' => 3, 'name' => 'Дифавтомат', 'code' => 'RCBO']
                    ]
                ]);
            default:
                return response()->json(['data' => []]);
        }
    }
}
