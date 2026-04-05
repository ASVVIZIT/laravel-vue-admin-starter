<?php

namespace App\Http\Controllers\Api\SmartLight\Core;

use App\Http\Controllers\Controller;
use App\Http\Resources\SmartLight\Core\CoreBatteryTypeResource;
use App\Http\Resources\SmartLight\Core\CoreBulbTypeResource;
use App\Http\Resources\SmartLight\Core\CorePowerSupplyResource;
use App\Models\SmartLight\BatteryType;
use App\Models\SmartLight\BulbType;
use App\Models\SmartLight\PowerSupply;

class CoreTypesController extends Controller
{
    public function batteryTypes()
    {
        // Если модели есть в БД — используем их, иначе хардкод
        $types = BatteryType::exists()
            ? BatteryType::all()
            : collect($this->getHardcodedBatteryTypes());

        return response()->json([
            'success' => true,
            'data' => CoreBatteryTypeResource::collection($types)
        ]);
    }

    public function bulbTypes()
    {
        $types = BulbType::exists()
            ? BulbType::all()
            : collect($this->getHardcodedBulbTypes());

        return response()->json([
            'success' => true,
            'data' => CoreBulbTypeResource::collection($types)
        ]);
    }

    public function powerSupplies()
    {
        $types = PowerSupply::exists()
            ? PowerSupply::all()
            : collect($this->getHardcodedPowerSupplies());

        return response()->json([
            'success' => true,
            'data' => CorePowerSupplyResource::collection($types)
        ]);
    }

    // Хардкод-данные как фолбэк
    private function getHardcodedBatteryTypes(): array { /* ... */ }
    private function getHardcodedBulbTypes(): array { /* ... */ }
    private function getHardcodedPowerSupplies(): array { /* ... */ }
}
