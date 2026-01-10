<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VigiDifferentialSeeder extends Seeder
{
    public function run()
    {
        $brand = Brand::where('name', 'Schneider Electric')->first();

        // Получаем ID типа устройства "ACCESSORY" с проверкой
        $deviceType = DeviceType::where('code', 'ACCESSORY')->first();
        if (!$deviceType) {
            $deviceType = DeviceType::updateOrCreate([
                'code' => 'ACCESSORY',
                'name' => 'Аксессуар',
                'description' => 'Дифференциальные блоки и вспомогательные устройства',
            ]);
        }

        // Получаем ID единицы "мА"
        // Получаем единицы измерения с нормализацией символов
        $units = MeasurementUnit::all()->mapWithKeys(function ($unit) {
            return [Str::lower($unit->symbol) => $unit->id];
        });

        $mAUnitId = $units['ма'] ?? null;

        // Модели дифференциальных блоков Vigi iC60
        $diffUnits = ['10', '30', '100', '300', '500', '1000'];

        foreach ($diffUnits as $unit) {
            Accessory::updateOrCreate(
                ['model' => "Vigi iC60 {$unit}mA"],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $deviceType->id,
                    'series' => 'Vigi',
                    'name' => "Дифференциальный модуль {$unit} mA",
                    'rated_diff_current' => $unit,
                    'rated_diff_current_unit_id' => $mAUnitId,
                    'compatible_models' => 'iC60N, iC60H',
                    'standards' => 'IEC 61009-1',
                    'ip_rating' => 'IP20',
                    'mounting_type' => 'Модульный (9 мм)',
                ]
            );
        }
    }
}
