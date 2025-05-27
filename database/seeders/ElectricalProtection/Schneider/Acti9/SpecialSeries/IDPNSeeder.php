<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class IDPNSeeder extends Seeder
{
    public function run()
    {
        $schneider = Brand::where('name', 'Schneider Electric')->first();
        $units = MeasurementUnit::pluck('id', 'symbol');

        /**
         * Описание:
         * Серия Acti9 IDPN — защита нулевого проводника.
         * Номинальный ток: 0.5–63 A.
         * Количество полюсов: 1P+N.
         * Кривые срабатывания: C.
         */

        $models = [
            ['iDPN N 1P+N C0.5', 1, 0.5, 'C', 'C'],
            ['iDPN N 1P+N C1', 1, 1, 'C', 'C'],
            ['iDPN N 1P+N C2', 1, 2, 'C', 'C'],
            ['iDPN N 1P+N C3', 1, 3, 'C', 'C'],
            ['iDPN N 1P+N C4', 1, 4, 'C', 'C'],
            ['iDPN N 1P+N C6', 1, 6, 'C', 'C'],
            ['iDPN N 1P+N C10', 1, 10, 'C', 'C'],
            ['iDPN N 1P+N C13', 1, 13, 'C', 'C'],
            ['iDPN N 1P+N C16', 1, 16, 'C', 'C'],
            ['iDPN N 1P+N C20', 1, 20, 'C', 'C'],
            ['iDPN N 1P+N C25', 1, 25, 'C', 'C'],
            ['iDPN N 1P+N C32', 1, 32, 'C', 'C'],
            ['iDPN N 1P+N C40', 1, 40, 'C', 'C'],
            ['iDPN N 1P+N C50', 1, 50, 'C', 'C'],
            ['iDPN N 1P+N C63', 1, 63, 'C', 'C'],
        ];

        foreach ($models as $model) {
            $breaker = CircuitBreaker::updateOrCreate(
                ['model' => $model[0]],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => DeviceType::where('code', 'RCBO')->first()->id, // Используем RCBO
                    'series' => 'Acti9 IDPN',
                    'type' => $model[4],
                    'poles' => $model[1],
                    'modular_size' => $model[1] . 'D',
                    'nominal_current' => $model[2],
                    'nominal_current_unit_id' => $units['A'],
                    'trip_curve' => $model[3],
                    'breaking_capacity' => '6',
                    'breaking_capacity_unit_id' => $units['кА'],
                    'tripping_time' => 20,
                    'tripping_time_unit_id' => $units['мс'],
                    'rated_diff_current' => null,
                    'voltage' => '400',
                    'voltage_unit_id' => $units['V'],
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ, защита нулевого проводника',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°C'],
                    'temperature_range_max' => 55,
                    'temperature_range_max_unit_id' => $units['°C'],
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60947-2',
                    'rcd_type' => null,
                    'combined_protection' => 'Нулевой проводник'
                ]
            );

            // Добавляем аксессуары
            $breaker->accessories()->attach([
                Accessory::where('model', 'iOF Signal')->first()->id,
                Accessory::where('model', 'AB1-GZ')->first()->id,
                Accessory::where('model', 'Plumbed Terminal Caps 3P')->first()->id,
            ]);

        }
    }
}
