<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class IDSeeder extends Seeder
{
    public function run()
    {
        $schneider = Brand::where('name', 'Schneider Electric')->first();
        $units = MeasurementUnit::pluck('id', 'symbol');

        if (!$schneider) {
            $schneider = Brand::create([
                'name' => 'Schneider Electric',
                'country' => 'Франция',
                'website' => 'https://www.se.com ',
                'description' => 'Мировой лидер в области автоматизации и управления энергией',
            ]);
        }

        // Получаем ID типа устройства "RCD" (дифференциальное)
        $deviceType = DeviceType::where('code', 'RCD')->first();

        if (!$deviceType) {
            $deviceType = DeviceType::updateOrCreate([
                'code' => 'RCD',
                'name' => 'Дифференциальное устройство',
                'description' => 'Защита от тока утечки',
            ]);
        }

        // Полный модельный ряд Acti9 iID и RCCB-iID
        $models = [
            // Основная серия iID — дифференциальные выключатели нагрузки
            ['iID 1P 10mA', 1, 10, 'C'],
            ['iID 1P 30mA', 1, 30, 'C'],
            ['iID 2P 10mA', 2, 10, 'C'],
            ['iID 2P 30mA', 2, 30, 'C'],
            ['iID 3P 10mA', 3, 10, 'C'],
            ['iID 3P 30mA', 3, 30, 'C'],
            ['iID 4P 10mA', 4, 10, 'C'],
            ['iID 4P 30mA', 4, 30, 'C'],

            // Серия RCCB-iID — дифференциальные выключатели нагрузки
            ['RCCB-iID 1P 10mA', 1, 10, 'C'],
            ['RCCB-iID 1P 30mA', 1, 30, 'C'],
            ['RCCB-iID 2P 10mA', 2, 10, 'C'],
            ['RCCB-iID 2P 30mA', 2, 30, 'C'],
            ['RCCB-iID 3P 10mA', 3, 10, 'C'],
            ['RCCB-iID 3P 30mA', 3, 30, 'C'],
            ['RCCB-iID 4P 10mA', 4, 10, 'C'],
            ['RCCB-iID 4P 30mA', 4, 30, 'C'],

            // Дополнительные модели из документации
            ['RCCB-ID 125A', 3, 125, 'C'],
            ['RCCB-ID 80A', 3, 80, 'C'],
            ['RCCB-ID 63A', 3, 63, 'C'],
            ['RCCB-ID 50A', 3, 50, 'C'],
            ['RCCB-ID 40A', 3, 40, 'C'],
            ['RCCB-ID 32A', 3, 32, 'C'],
            ['RCCB-ID 25A', 3, 25, 'C'],
            ['RCCB-ID 20A', 3, 20, 'C'],
            ['RCCB-ID 16A', 3, 16, 'C'],
            ['RCCB-ID 13A', 3, 13, 'C'],
            ['RCCB-ID 10A', 3, 10, 'C'],
        ];

        foreach ($models as $item) {
            $breaker = CircuitBreaker::updateOrCreate(
                ['model' => $item[0]],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => $deviceType->id,
                    'series' => 'Acti9 iID',
                    'type' => $item[3], // C, AC, B и т.д.
                    'poles' => $item[1],
                    'modular_size' => $item[1] . 'D',
                    'nominal_current' => $item[2],
                    'nominal_current_unit_id' => $units['мА'] ?? null,
                    'trip_curve' => $item[3],
                    'breaking_capacity' => 6, // Icu=6 kA
                    'breaking_capacity_unit_id' => $units['кА'] ?? null,
                    'voltage' => '400',
                    'voltage_unit_id' => $units['V'] ?? null,
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Дифференциальная защита',
                    'combined_protection' => 'Диф. защита',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°C'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°C'] ?? null,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898, IEC 60947-2',
                ]
            );

            $accessories = [
                optional(Accessory::where('model', 'Ti24 Interface Module')->first())->id,
                optional(Accessory::where('model', 'Plumbed Terminal Caps 3P')->first())->id,
            ];

            $breaker->accessories()->sync(array_filter($accessories));
        }
    }
}
