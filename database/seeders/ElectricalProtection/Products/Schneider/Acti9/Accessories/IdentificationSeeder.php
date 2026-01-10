<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class IdentificationSeeder extends Seeder
{
    public function run()
    {
        $brand = Brand::where('name', 'Schneider Electric')->first();
        $deviceType = DeviceType::where('code', 'ACCESSORY')->first();
        // Получаем единицы измерения с нормализацией символов
        $units = MeasurementUnit::all()->mapWithKeys(function ($unit) {
            return [Str::lower($unit->symbol) => $unit->id];
        });
        // Цифровые этикетки (AB1-R0–R9)
        for ($i = 0; $i <= 9; $i++) {
            Accessory::updateOrCreate(
                ['model' => "AB1-R$i"],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $deviceType->id,
                    'series' => 'Acti9 Identification',
                    'name' => "Этикетка $i",
                    'description' => "Цифровая маркировка $i",
                    'quantity_per_pack' => 10,
                ]
            );
        }


        // Графические этикетки (AB1-GA–GZ)
        $letters = range('A', 'Z');
        foreach ($letters as $letter) {
            Accessory::updateOrCreate(
                ['model' => "AB1-G$letter"],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $deviceType->id,
                    'series' => 'Acti9 Identification',
                    'name' => "Этикетка $letter",
                    'description' => "Графическая маркировка $letter",
                    'quantity_per_pack' => 250,
                ]
            );
        }

        // Чистая этикетка
        Accessory::updateOrCreate(
            ['model' => 'AB1-RV'],
            [
                'brand_id' => $brand->id,
                'type_id' => $deviceType->id,
                'series' => 'Acti9 Identification',
                'name' => 'Чистая этикетка',
                'description' => 'Без предварительной маркировки',
                'quantity_per_pack' => 1,
            ]
        );
    }
}
