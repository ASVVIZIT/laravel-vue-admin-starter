<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Database\Seeder;

class SpecialAccessoriesSeeder extends Seeder
{
    public function run()
    {
        $schneider = Brand::where('name', 'Schneider Electric')->first();

        $accessories = [
            ['iMN Расцепитель', 'Расцепитель минимального напряжения', 'iC60'],
            ['iMSU', 'Расцепитель максимального напряжения', 'iC60'],
            ['iMX+OF', 'Независимый расцепитель с OF-контактом', 'iC60'],
            ['Mechanical Spacer', 'Перегородка между аппаратами', 'Acti9'],
        ];

        foreach ($accessories as $item) {
            Accessory::updateOrCreate(
                ['model' => $item[0]],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => DeviceType::where('code', 'ACCESSORY')->first()->id,
                    'series' => 'Acti9 Special',
                    'name' => $item[0],
                    'description' => $item[1],
                    'compatible_models' => $item[2],
                ]
            );
        }
    }
}
