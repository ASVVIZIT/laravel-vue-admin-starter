<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CableAccessoriesSeeder extends Seeder
{
    public function run()
    {
        $brand = Brand::where('name', 'Schneider Electric')->first();

        // Получаем ID типа устройства "ACCESSORY"
        $deviceType = DeviceType::where('code', 'ACCESSORY')->first();
        if (!$deviceType) {
            $deviceType = DeviceType::updateOrCreate([
                'code' => 'ACCESSORY',
                'name' => 'Аксессуар',
                'description' => 'Кабельные и монтажные аксессуары Acti9',
            ]);
        }

        // Получаем единицы измерения с нормализацией символов
        $units = MeasurementUnit::all()->mapWithKeys(function ($unit) {
            return [Str::lower($unit->symbol) => $unit->id];
        });

        /**
         * Кабельные аксессуары
         */
        $accessories = [
            // Клемма для алюминиевых кабелей
            [
                'model' => 'Al 50 мм²',
                'name' => 'Клемма для алюминиевых кабелей',
                'description' => 'Для подключения алюминиевых кабелей сечением до 50 мм²',
                'cross_section' => 70,
                'cross_section_unit_id' => $units['мм²'] ?? null,
                'current_rating' => 16,
                'current_rating_unit_id' => $units['а'] ?? null,
                'material' => 'Al',
                'quantity_per_pack' => 10,
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
                'ip_rating' => 'IP40',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-1',
                'compatible_models' => 'iC60N, iC60H, iC60L',
            ],
            // Винтовая клемма под кольцевой наконечник
            [
                'model' => 'Terminal Lug',
                'name' => 'Винтовая клемма под кольцевой наконечник',
                'description' => 'Для медных кабелей с кольцевым наконечником',
                'cross_section' => 16,
                'cross_section_unit_id' => $units['мм²'] ?? null,
                'current_rating' => 25,
                'current_rating_unit_id' => $units['а'] ?? null,
                'material' => 'Cu',
                'quantity_per_pack' => 250,
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
                'ip_rating' => 'IP40',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-1',
                'compatible_models' => 'iC60N, iC60H, iC60L',
            ],
            // Распределительная колодка
            [
                'model' => 'Distribution Block',
                'name' => 'Распределительная колодка',
                'description' => 'Для расключения 4 проводников',
                'cross_section' => 4,
                'cross_section_unit_id' => $units['мм²'] ?? null,
                'quantity_per_pack' => 1,
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
                'ip_rating' => 'IP40',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-1',
                'compatible_models' => 'iC60N, iC60H, iC60L',
            ],
            // Пломбируемая заглушка
            [
                'model' => 'Plumbed Terminal Caps 2P',
                'name' => 'Пломбируемая заглушка 2P',
                'description' => 'Для защиты от несанкционированного доступа к контактам',
                'quantity_per_pack' => 2,
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
                'ip_rating' => 'IP40',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-1',
                'compatible_models' => 'iC60N, iC60H, iC60L',
            ],
            // Межполюсная перегородка
            [
                'model' => 'PZ1 Spacer',
                'name' => 'Межполюсная перегородка',
                'description' => 'Для изоляции полюсов автоматического выключателя',
                'quantity_per_pack' => 10,
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
                'ip_rating' => 'IP40',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-1',
                'compatible_models' => 'iC60N, iC60H, iC60L',
            ],
            // Этикетка AB1-R0
            [
                'model' => 'AB1-R0',
                'name' => 'Этикетка AB1-R0',
                'description' => 'Цифровая маркировка',
                'quantity_per_pack' => 10,
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
                'ip_rating' => 'IP40',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-1',
                'compatible_models' => 'iC60N, iC60H, iC60L',
            ],
            // Клемма для алюминия 70 мм²
            [
                'model' => 'Aluminum Lug 70mm²',
                'name' => 'Клемма для алюминиевого кабеля 70 мм²',
                'description' => 'Для подключения алюминиевых кабелей большого сечения',
                'cross_section' => 70,
                'cross_section_unit_id' => $units['мм²'] ?? null,
                'current_rating' => 16,
                'current_rating_unit_id' => $units['а'] ?? null,
                'material' => 'Al',
                'quantity_per_pack' => 2,
                'quantity_per_pack_unit_id' => $units['шт.'] ?? null,
                'ip_rating' => 'IP40',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-1',
                'compatible_models' => 'iC60N, iC60H, iC60L',
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
                    'cross_section' => $item['cross_section'] ?? null,
                    'cross_section_unit_id' => $item['cross_section_unit_id'] ?? null,
                    'current_rating' => $item['current_rating'] ?? null,
                    'current_rating_unit_id' => $item['current_rating_unit_id'] ?? null,
                    'material' => $item['material'] ?? null,
                    'quantity_per_pack' => $item['quantity_per_pack'] ?? null,
                    'quantity_per_pack_unit_id' => $item['quantity_per_pack_unit_id'] ?? null,
                    'ip_rating' => $item['ip_rating'] ?? null,
                    'mounting_type' => $item['mounting_type'] ?? null,
                    'standards' => $item['standards'] ?? null,
                    'compatible_models' => $item['compatible_models'] ?? null,
                ]
            );
        }
    }
}
