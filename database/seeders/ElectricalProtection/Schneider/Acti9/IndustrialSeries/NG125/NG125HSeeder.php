<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\NG125;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class NG125HSeeder extends Seeder
{
    public function run()
    {
        $schneider = Brand::where('name', 'Schneider Electric')->first();

        if (!$schneider) {
            $schneider = Brand::updateOrCreate([
                'name' => 'Schneider Electric',
                'country' => 'Франция',
                'website' => 'https://www.se.com ',
                'description' => 'Мировой лидер в области автоматизации и управления энергией',
            ]);
        }

        $units = MeasurementUnit::pluck('id', 'symbol');

        $cbType = DeviceType::where('code', 'CB')->first();

        if (!$cbType) {
            $cbType = DeviceType::updateOrCreate([
                'code' => 'CB',
                'name' => 'Автоматический выключатель',
                'description' => 'Защита от перегрузки и КЗ',
            ]);
        }

        $models = [
            ['NG125H 1P C10', 1, 10, 'C'],
            ['NG125H 1P C16', 1, 16, 'C'],
            ['NG125H 1P C20', 1, 20, 'C'],
            ['NG125H 1P C25', 1, 25, 'C'],
            ['NG125H 1P C32', 1, 32, 'C'],
            ['NG125H 1P C40', 1, 40, 'C'],
            ['NG125H 1P C50', 1, 50, 'C'],
            ['NG125H 1P C63', 1, 63, 'C'],
            ['NG125H 1P C80', 1, 80, 'C'],

            ['NG125H 2P C10', 2, 10, 'C'],
            ['NG125H 2P C16', 2, 16, 'C'],
            ['NG125H 2P C20', 2, 20, 'C'],
            ['NG125H 2P C25', 2, 25, 'C'],
            ['NG125H 2P C32', 2, 32, 'C'],
            ['NG125H 2P C40', 2, 40, 'C'],
            ['NG125H 2P C50', 2, 50, 'C'],
            ['NG125H 2P C63', 2, 63, 'C'],
            ['NG125H 2P C80', 2, 80, 'C'],


            ['NG125H 3P C10', 3, 10, 'C'],
            ['NG125H 3P C16', 3, 16, 'C'],
            ['NG125H 3P C20', 3, 20, 'C'],
            ['NG125H 3P C25', 3, 25, 'C'],
            ['NG125H 3P C32', 3, 32, 'C'],
            ['NG125H 3P C40', 3, 40, 'C'],
            ['NG125H 3P C50', 3, 50, 'C'],
            ['NG125H 3P C63', 3, 63, 'C'],
            ['NG125H 3P C80', 3, 80, 'C'],


            ['NG125H 4P C10', 4, 10, 'C'],
            ['NG125H 4P C16', 4, 16, 'C'],
            ['NG125H 4P C20', 4, 20, 'C'],
            ['NG125H 4P C25', 4, 25, 'C'],
            ['NG125H 4P C32', 4, 32, 'C'],
            ['NG125H 4P C40', 4, 40, 'C'],
            ['NG125H 4P C50', 4, 50, 'C'],
            ['NG125H 4P C63', 4, 63, 'C'],
            ['NG125H 4P C80', 4, 80, 'C'],
        ];

        foreach ($models as $item) {
            $modelName = $item[0];
            $poles = $item[1];
            $nominalCurrent = $item[2];
            $tripCurve = $item[3];

            $voltage = match ($poles) {
                1 => '230',
                default => '400',
            };

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => $cbType->id,
                    'series' => 'Acti9 NG125H',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['A'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => 25,
                    'breaking_capacity_unit_id' => $units['кА'] ?? null,
                    'tripping_time' => $this->determineTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'rated_diff_current' => null,
                    'rated_diff_current_unit_id' => $units['mA'] ?? null,
                    'voltage' => $voltage,
                    'voltage_unit_id' => $units['V'] ?? null,
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -10,
                    'temperature_range_min_unit_id' => $units['°C'] ?? null,
                    'temperature_range_max' => 60,
                    'temperature_range_max_unit_id' => $units['°C'] ?? null,
                    'pollution_degree' => 'Степень 3',
                    'housing_material' => 'Пластик',
                    'standards' => 'IEC 60947-2',
                    'rcd_type' => null,
                    'combined_protection' => null,
                ]
            );
        }
    }

    protected function determineTrippingTime(string $tripCurve): int
    {
        return match ($tripCurve) {
            'B' => 20,
            'C' => 25,
            'D' => 30,
            default => 25,
        };
    }
}
