<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\IndustrialSeries;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class C120Seeder extends Seeder
{
    public function run()
    {
        $brand = Brand::where('name', 'Schneider Electric')->first();

        if (!$brand) {
            $brand = Brand::updateOrCreate([
                'name' => 'Schneider Electric',
                'country' => 'Франция',
                'website' => 'https://www.se.com ',
                'description' => 'Мировой лидер в области автоматизации и управления энергией',
            ]);
        }

        $units = MeasurementUnit::pluck('id', 'symbol');

        /**
         * Описание:
         * Серия Acti9 C120 — промышленные автоматы.
         * Номинальный ток: 63–125 A.
         * Количество полюсов: 3P, 4P.
         * Кривые срабатывания: B, C, D.
         */

        $models = [
            // C120N (нормальные условия)
            ['C120N 3P B63', 3, 63, 'B', 'B'],
            ['C120N 3P B80', 3, 80, 'B', 'B'],
            ['C120N 3P B100', 3, 100, 'B', 'B'],
            ['C120N 3P B125', 3, 125, 'B', 'B'],

            ['C120N 4P C63', 4, 63, 'C', 'C'],
            ['C120N 4P C80', 4, 80, 'C', 'C'],
            ['C120N 4P C100', 4, 100, 'C', 'C'],
            ['C120N 4P C125', 4, 125, 'C', 'C'],

            ['C120N 3P D100', 3, 100, 'D', 'D'],
            ['C120N 3P D125', 3, 125, 'D', 'D'],

            // C120H (высокая отключающая способность)
            ['C120H 3P B63', 3, 63, 'B', 'B'],
            ['C120H 3P B80', 3, 80, 'B', 'B'],
            ['C120H 3P B100', 3, 100, 'B', 'B'],
            ['C120H 3P B125', 3, 125, 'B', 'B'],

            ['C120H 4P C63', 4, 63, 'C', 'C'],
            ['C120H 4P C80', 4, 80, 'C', 'C'],
            ['C120H 4P C100', 4, 100, 'C', 'C'],
            ['C120H 4P C125', 4, 125, 'C', 'C'],

            ['C120H 3P D100', 3, 100, 'D', 'D'],
            ['C120H 3P D125', 3, 125, 'D', 'D'],
        ];

        $cbType = DeviceType::where('code', 'CB')->first();

        foreach ($models as $model) {
            $breaker = CircuitBreaker::updateOrCreate(
                ['model' => $model[0]],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $cbType->id,
                    'series' => 'Acti9 C120',
                    'type' => $model[4],
                    'poles' => $model[1],
                    'modular_size' => $model[1] . 'D',
                    'nominal_current' => $model[2],
                    'nominal_current_unit_id' => $units['а'],
                    'trip_curve' => $model[3],
                    'breaking_capacity' => '25', // Icu=25 кА для C120H
                    'breaking_capacity_unit_id' => $units['ка'],
                    'tripping_time' => 30,
                    'tripping_time_unit_id' => $units['мс'],
                    'rated_diff_current' => null,
                    'voltage' => '440',
                    'voltage_unit_id' => $units['v'],
                    'energy_class' => 'A-IV',
                    'ip_rating' => 'IP54',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ (промышленные сети)',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°c'],
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°c'],
                    'pollution_degree' => 'Степень 3',
                    'housing_material' => 'Металл',
                    'standards' => 'IEC 60947-2',
                    'rcd_type' => null,
                    'combined_protection' => null
                ]
            );
            // Добавляем аксессуары
            $breaker->accessories()->attach([
                Accessory::where('model', 'iMSU')->first()->id,
                Accessory::where('model', 'Distribution Block')->first()->id,
                Accessory::where('model', 'AB1-R9')->first()->id,
                Accessory::where('model', 'Mechanical Spacer')->first()->id,
            ]);
        }
    }
}
