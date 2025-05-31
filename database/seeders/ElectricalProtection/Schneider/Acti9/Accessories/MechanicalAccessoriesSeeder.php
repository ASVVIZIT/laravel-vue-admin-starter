<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MechanicalAccessoriesSeeder extends Seeder
{
    public function run()
    {
        $brand = Brand::where('name', 'Schneider Electric')->first();
        $deviceType = DeviceType::where('code', 'ACCESSORY')->first();
        // Получаем единицы измерения с нормализацией символов
        $units = MeasurementUnit::all()->mapWithKeys(function ($unit) {
            return [Str::lower($unit->symbol) => $unit->id];
        });

        $accessories = [
            // Механическая блокировка
            [
                'model' => 'Mechanical Lock',
                'name' => 'Механическая блокировка',
                'description' => 'Блокировка для навесного замка',
                'compatible_models' => 'iC60N, iC60H, iDPN',
                'thickness' => 8, // Толщина дужки замка
                'thickness_unit_id' => $units['мм'] ?? null, // Единица толщины
            ],
            // Пломбируемая клеммная заглушка
            [
                'model' => 'Plumbed Terminal Caps 1P',
                'name' => 'Пломбируемая клеммная заглушка',
                'description' => 'Заглушка для кабельных клемм 1P',
                'compatible_models' => 'iC60, iDPN',
                'quantity_per_pack' => 2, // Количество в упаковке
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null, // Единица количества
            ],
            // Распределительная колодка
            [
                'model' => 'Distribution Block',
                'name' => 'Распределительная колодка',
                'description' => 'Колодка для расключения проводников',
                'compatible_models' => 'iC60, iDPN',
                'quantity_per_pack' => 1, // Количество в упаковке
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
            ],
            // Межполюсная перегородка
            [
                'model' => 'PZ1 Spacer',
                'name' => 'Межполюсная перегородка',
                'description' => 'Перегородка для изоляции полюсов',
                'compatible_models' => 'iC60, iDPN',
                'quantity_per_pack' => 10, // Количество в упаковке
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
            ],
        ];

        foreach ($accessories as $item) {
            Accessory::updateOrCreate(
                ['model' => $item['model']],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $deviceType->id,
                    'series' => 'Acti9 Mounting',
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'compatible_models' => $item['compatible_models'] ?? null,
                    'thickness' => $item['thickness'] ?? null, // Толщина дужки замка
                    'thickness_unit_id' => $item['thickness_unit_id'] ?? null,
                    'quantity_per_pack' => $item['quantity_per_pack'] ?? null, // Количество в упаковке
                    'quantity_per_pack_unit_id' => $item['quantity_per_pack_unit_id'] ?? null,
                ]
            );
        }
    }
}
