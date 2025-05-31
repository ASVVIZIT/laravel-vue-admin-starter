<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\NG125;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NG125LSeeder extends Seeder
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

        $units = MeasurementUnit::all()->mapWithKeys(function ($unit) {
            return [Str::lower($unit->symbol) => $unit->id];
        });

        $cbType = DeviceType::where('code', 'CB')->first();

        if (!$cbType) {
            $cbType = DeviceType::updateOrCreate([
                'code' => 'CB',
                'name' => 'Автоматический выключатель',
                'description' => 'Защита от перегрузки и КЗ',
            ]);
        }

        $models = [
            ['NG125L 1P B10', 1, 10, 'B'],
            ['NG125L 1P B16', 1, 16, 'B'],
            ['NG125L 1P B20', 1, 20, 'B'],
            ['NG125L 1P B25', 1, 25, 'B'],
            ['NG125L 1P B32', 1, 32, 'B'],
            ['NG125L 1P B40', 1, 40, 'B'],
            ['NG125L 1P B50', 1, 50, 'B'],
            ['NG125L 1P B63', 1, 63, 'B'],
            ['NG125L 1P B80', 1, 80, 'B'],


            ['NG125L 2P B10', 2, 10, 'B'],
            ['NG125L 2P B16', 2, 16, 'B'],
            ['NG125L 2P B20', 2, 20, 'B'],
            ['NG125L 2P B25', 2, 25, 'B'],
            ['NG125L 2P B32', 2, 32, 'B'],
            ['NG125L 2P B40', 2, 40, 'B'],
            ['NG125L 2P B50', 2, 50, 'B'],
            ['NG125L 2P B63', 2, 63, 'B'],
            ['NG125L 2P B80', 2, 80, 'B'],


            ['NG125L 3P B10', 3, 10, 'B'],
            ['NG125L 3P B16', 3, 16, 'B'],
            ['NG125L 3P B20', 3, 20, 'B'],
            ['NG125L 3P B25', 3, 25, 'B'],
            ['NG125L 3P B32', 3, 32, 'B'],
            ['NG125L 3P B40', 3, 40, 'B'],
            ['NG125L 3P B50', 3, 50, 'B'],
            ['NG125L 3P B63', 3, 63, 'B'],
            ['NG125L 3P B80', 3, 80, 'B'],


            ['NG125L 4P B10', 4, 10, 'B'],
            ['NG125L 4P B16', 4, 16, 'B'],
            ['NG125L 4P B20', 4, 20, 'B'],
            ['NG125L 4P B25', 4, 25, 'B'],
            ['NG125L 4P B32', 4, 32, 'B'],
            ['NG125L 4P B40', 4, 40, 'B'],
            ['NG125L 4P B50', 4, 50, 'B'],
            ['NG125L 4P B63', 4, 63, 'B'],
            ['NG125L 4P B80', 4, 80, 'B'],


            ['NG125L 1P C10', 1, 10, 'C'],
            ['NG125L 1P C16', 1, 16, 'C'],
            ['NG125L 1P C20', 1, 20, 'C'],
            ['NG125L 1P C25', 1, 25, 'C'],
            ['NG125L 1P C32', 1, 32, 'C'],
            ['NG125L 1P C40', 1, 40, 'C'],
            ['NG125L 1P C50', 1, 50, 'C'],
            ['NG125L 1P C63', 1, 63, 'C'],
            ['NG125L 1P C80', 1, 80, 'C'],


            ['NG125L 2P C10', 2, 10, 'C'],
            ['NG125L 2P C16', 2, 16, 'C'],
            ['NG125L 2P C20', 2, 20, 'C'],
            ['NG125L 2P C25', 2, 25, 'C'],
            ['NG125L 2P C32', 2, 32, 'C'],
            ['NG125L 2P C40', 2, 40, 'C'],
            ['NG125L 2P C50', 2, 50, 'C'],
            ['NG125L 2P C63', 2, 63, 'C'],
            ['NG125L 2P C80', 2, 80, 'C'],


            ['NG125L 3P C10', 3, 10, 'C'],
            ['NG125L 3P C16', 3, 16, 'C'],
            ['NG125L 3P C20', 3, 20, 'C'],
            ['NG125L 3P C25', 3, 25, 'C'],
            ['NG125L 3P C32', 3, 32, 'C'],
            ['NG125L 3P C40', 3, 40, 'C'],
            ['NG125L 3P C50', 3, 50, 'C'],
            ['NG125L 3P C63', 3, 63, 'C'],
            ['NG125L 3P C80', 3, 80, 'C'],


            ['NG125L 4P C10', 4, 10, 'C'],
            ['NG125L 4P C16', 4, 16, 'C'],
            ['NG125L 4P C20', 4, 20, 'C'],
            ['NG125L 4P C25', 4, 25, 'C'],
            ['NG125L 4P C32', 4, 32, 'C'],
            ['NG125L 4P C40', 4, 40, 'C'],
            ['NG125L 4P C50', 4, 50, 'C'],
            ['NG125L 4P C63', 4, 63, 'C'],
            ['NG125L 4P C80', 4, 80, 'C'],


            ['NG125L 1P D10', 1, 10, 'D'],
            ['NG125L 1P D16', 1, 16, 'D'],
            ['NG125L 1P D20', 1, 20, 'D'],
            ['NG125L 1P D25', 1, 25, 'D'],
            ['NG125L 1P D32', 1, 32, 'D'],
            ['NG125L 1P D40', 1, 40, 'D'],
            ['NG125L 1P D50', 1, 50, 'D'],
            ['NG125L 1P D63', 1, 63, 'D'],
            ['NG125L 1P D80', 1, 80, 'D'],


            ['NG125L 2P D10', 2, 10, 'D'],
            ['NG125L 2P D16', 2, 16, 'D'],
            ['NG125L 2P D20', 2, 20, 'D'],
            ['NG125L 2P D25', 2, 25, 'D'],
            ['NG125L 2P D32', 2, 32, 'D'],
            ['NG125L 2P D40', 2, 40, 'D'],
            ['NG125L 2P D50', 2, 50, 'D'],
            ['NG125L 2P D63', 2, 63, 'D'],
            ['NG125L 2P D80', 2, 80, 'D'],


            ['NG125L 3P D10', 3, 10, 'D'],
            ['NG125L 3P D16', 3, 16, 'D'],
            ['NG125L 3P D20', 3, 20, 'D'],
            ['NG125L 3P D25', 3, 25, 'D'],
            ['NG125L 3P D32', 3, 32, 'D'],
            ['NG125L 3P D40', 3, 40, 'D'],
            ['NG125L 3P D50', 3, 50, 'D'],
            ['NG125L 3P D63', 3, 63, 'D'],
            ['NG125L 3P D80', 3, 80, 'D'],


            ['NG125L 4P D10', 4, 10, 'D'],
            ['NG125L 4P D16', 4, 16, 'D'],
            ['NG125L 4P D20', 4, 20, 'D'],
            ['NG125L 4P D25', 4, 25, 'D'],
            ['NG125L 4P D32', 4, 32, 'D'],
            ['NG125L 4P D40', 4, 40, 'D'],
            ['NG125L 4P D50', 4, 50, 'D'],
            ['NG125L 4P D63', 4, 63, 'D'],
            ['NG125L 4P D80', 4, 80, 'D'],
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
                    'brand_id' => $brand->id,
                    'type_id' => $cbType->id,
                    'series' => 'Acti9 NG125L',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => 25,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'tripping_time' => $this->determineTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'rated_diff_current' => null,
                    'rated_diff_current_unit_id' => $units['ма'] ?? null,
                    'voltage' => $voltage,
                    'voltage_unit_id' => $units['v'] ?? null,
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -10,
                    'temperature_range_min_unit_id' => $units['°c'] ?? null,
                    'temperature_range_max' => 60,
                    'temperature_range_max_unit_id' => $units['°c'] ?? null,
                    'pollution_degree' => 'Степень 3',
                    'housing_material' => 'Пластик',
                    'standards' => 'IEC 60947-2',
                    'rcd_type' => null,
                    'combined_protection' =>null,
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
