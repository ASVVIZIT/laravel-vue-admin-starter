<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VigiNG125Seeder extends Seeder
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

        $accessories = [
            ['Vigi NG125 10mA', 'Дифференциальный модуль', 10, 'ма', 'NG125'],
            ['Vigi NG125 30mA', 'Дифференциальный модуль', 30, 'ма', 'NG125'],
            ['Vigi NG125 100mA', 'Дифференциальный модуль', 100, 'ма', 'NG125'],
            ['Vigi NG125 300mA', 'Дифференциальный модуль', 300, 'ма', 'NG125'],
            ['Vigi NG125 500mA', 'Дифференциальный модуль', 500, 'ма', 'NG125'],
            ['Vigi NG125 1000mA', 'Дифференциальный модуль', 1000, 'ма', 'NG125'],
        ];

        foreach ($accessories as $item) {
            Accessory::updateOrCreate(
                ['model' => $item[0]],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $deviceType->id,
                    'series' => "Vigi {$item[4]}",
                    'name' => $item[1],
                    'description' => "Для автоматов {$item[4]}",
                    'rated_diff_current' => $item[2],
                    'rated_diff_current_unit_id' => $mAUnitId,
                    'compatible_models' => 'NG125N, NG125H, NG125L',
                    'standards' => 'IEC 60947-2, IEC 61009-1',
                    'ip_rating' => 'IP20',
                    'mounting_type' => 'Модульный (9 мм)',
                    'communication_protocol' => 'Ti24',
                    'remote_control' => false,
                ]
            );
        }
    }
}
