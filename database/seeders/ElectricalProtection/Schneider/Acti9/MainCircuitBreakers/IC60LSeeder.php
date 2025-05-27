<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\MainCircuitBreakers;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\MeasurementUnit;
use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Database\Seeder;

class IC60LSeeder extends Seeder
{
    public function run()
    {
        $schneider = Brand::where('name', 'Schneider Electric')->first();

        if (!$schneider) {
            $schneider = Brand::create([
                'name' => 'Schneider Electric',
                'country' => 'Франция',
                'website' => 'https://www.se.com ',
                'description' => 'Мировой лидер в области автоматизации и управления энергией',
            ]);
        }

        $deviceType = DeviceType::where('code', 'CB')->first();
        if (!$deviceType) {
            $deviceType = DeviceType::create([
                'code' => 'CB',
                'name' => 'Автоматический выключатель',
                'description' => 'Защита от перегрузки и короткого замыкания',
            ]);
        }

        $units = MeasurementUnit::pluck('id', 'symbol');

        $models = [
            // Кривая B
            ['iC60L 1P B0.5', 1, 0.5, 'B', 'B'],
            ['iC60L 1P B1', 1, 1, 'B', 'B'],
            ['iC60L 1P B2', 1, 2, 'B', 'B'],
            ['iC60L 1P B3', 1, 3, 'B', 'B'],
            ['iC60L 1P B4', 1, 4, 'B', 'B'],
            ['iC60L 1P B6', 1, 6, 'B', 'B'],
            ['iC60L 1P B10', 1, 10, 'B', 'B'],
            ['iC60L 1P B16', 1, 16, 'B', 'B'],
            ['iC60L 1P B20', 1, 20, 'B', 'B'],
            ['iC60L 1P B25', 1, 25, 'B', 'B'],
            ['iC60L 1P B32', 1, 32, 'B', 'B'],
            ['iC60L 1P B40', 1, 40, 'B', 'B'],
            ['iC60L 1P B50', 1, 50, 'B', 'B'],
            ['iC60L 1P B63', 1, 63, 'B', 'B'],

            ['iC60L 2P B0.5', 2, 0.5, 'B', 'B'],
            ['iC60L 2P B1', 2, 1, 'B', 'B'],
            ['iC60L 2P B2', 2, 2, 'B', 'B'],
            ['iC60L 2P B3', 2, 3, 'B', 'B'],
            ['iC60L 2P B4', 2, 4, 'B', 'B'],
            ['iC60L 2P B6', 2, 6, 'B', 'B'],
            ['iC60L 2P B10', 2, 10, 'B', 'B'],
            ['iC60L 2P B16', 2, 16, 'B', 'B'],
            ['iC60L 2P B20', 2, 20, 'B', 'B'],
            ['iC60L 2P B25', 2, 25, 'B', 'B'],
            ['iC60L 2P B32', 2, 32, 'B', 'B'],
            ['iC60L 2P B40', 2, 40, 'B', 'B'],
            ['iC60L 2P B50', 2, 50, 'B', 'B'],
            ['iC60L 2P B63', 2, 63, 'B', 'B'],

            ['iC60L 3P B10', 3, 10, 'B', 'B'],
            ['iC60L 3P B16', 3, 16, 'B', 'B'],
            ['iC60L 3P B20', 3, 20, 'B', 'B'],
            ['iC60L 3P B25', 3, 25, 'B', 'B'],
            ['iC60L 3P B32', 3, 32, 'B', 'B'],
            ['iC60L 3P B40', 3, 40, 'B', 'B'],
            ['iC60L 3P B50', 3, 50, 'B', 'B'],
            ['iC60L 3P B63', 3, 63, 'B', 'B'],

            ['iC60L 4P B10', 4, 10, 'B', 'B'],
            ['iC60L 4P B16', 4, 16, 'B', 'B'],
            ['iC60L 4P B20', 4, 20, 'B', 'B'],
            ['iC60L 4P B25', 4, 25, 'B', 'B'],
            ['iC60L 4P B32', 4, 32, 'B', 'B'],
            ['iC60L 4P B40', 4, 40, 'B', 'B'],
            ['iC60L 4P B50', 4, 50, 'B', 'B'],
            ['iC60L 4P B63', 4, 63, 'B', 'B'],
        ];

        foreach ($models as $item) {
            $modelName = $item[0];
            $poles = $item[1];
            $nominalCurrent = $item[2];
            $tripCurve = $item[3];

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => $deviceType->id,
                    'series' => 'Acti9 iC60L',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['A'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => 100,
                    'breaking_capacity_unit_id' => $units['кА'] ?? null,
                    'tripping_time' => $this->getTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'voltage' => $this->getVoltageByPoles($poles),
                    'voltage_unit_id' => $units['V'] ?? null,
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP20',
                    'terminal_type' => 'Винтовой',
                    'protection' => 'Токовая перегрузка, КЗ, Защита двигателей',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°C'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°C'] ?? null,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898, IEC 60947-2',
                    'combined_protection' => 'Защита двигателей',
                ]
            );
        }
    }

    protected function getVoltageByPoles(int $poles): string
    {
        return match ($poles) {
            1 => '230',
            default => '400',
        };
    }

    protected function getTrippingTime(string $tripCurve): int
    {
        return match ($tripCurve) {
            'B' => 20,
            'C' => 25,
            'K' => 30,
            'Z' => 35,
            default => 30,
        };
    }
}
