<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\SpecialSeries\ReflexIC60;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class ReflexIC60DSeeder extends Seeder
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
        $cbType = DeviceType::where('code', 'CB')->first();

        $models = [
            ['Reflex iC60 1P 0.5A D', 1, 0.5],
            ['Reflex iC60 1P 1A D', 1, 1],
            ['Reflex iC60 1P 2A D', 1, 2],
            ['Reflex iC60 1P 3A D', 1, 3],
            ['Reflex iC60 1P 4A D', 1, 4],
            ['Reflex iC60 1P 6A D', 1, 6],
            ['Reflex iC60 1P 10A D', 1, 10],
            ['Reflex iC60 1P 16A D', 1, 16],
            ['Reflex iC60 1P 20A D', 1, 20],
            ['Reflex iC60 1P 25A D', 1, 25],
            ['Reflex iC60 1P 32A D', 1, 32],
            ['Reflex iC60 1P 40A D', 1, 40],
            ['Reflex iC60 1P 50A D', 1, 50],
            ['Reflex iC60 1P 63A D', 1, 63],


            ['Reflex iC60 2P 0.5A D', 2, 0.5],
            ['Reflex iC60 2P 1A D', 2, 1],
            ['Reflex iC60 2P 2A D', 2, 2],
            ['Reflex iC60 2P 3A D', 2, 3],
            ['Reflex iC60 2P 4A D', 2, 4],
            ['Reflex iC60 2P 6A D', 2, 6],
            ['Reflex iC60 2P 10A D', 2, 10],
            ['Reflex iC60 2P 16A D', 2, 16],
            ['Reflex iC60 2P 20A D', 2, 20],
            ['Reflex iC60 2P 25A D', 2, 25],
            ['Reflex iC60 2P 32A D', 2, 32],
            ['Reflex iC60 2P 40A D', 2, 40],
            ['Reflex iC60 2P 50A D', 2, 50],
            ['Reflex iC60 2P 63A D', 2, 63],


            ['Reflex iC60 3P 0.5A D', 3, 0.5],
            ['Reflex iC60 3P 1A D', 3, 1],
            ['Reflex iC60 3P 2A D', 3, 2],
            ['Reflex iC60 3P 3A D', 3, 3],
            ['Reflex iC60 3P 4A D', 3, 4],
            ['Reflex iC60 3P 6A D', 3, 6],
            ['Reflex iC60 3P 10A D', 3, 10],
            ['Reflex iC60 3P 16A D', 3, 16],
            ['Reflex iC60 3P 20A D', 3, 20],
            ['Reflex iC60 3P 25A D', 3, 25],
            ['Reflex iC60 3P 32A D', 3, 32],
            ['Reflex iC60 3P 40A D', 3, 40],
            ['Reflex iC60 3P 50A D', 3, 50],
            ['Reflex iC60 3P 63A D', 3, 63],


            ['Reflex iC60 4P 0.5A D', 4, 0.5],
            ['Reflex iC60 4P 1A D', 4, 1],
            ['Reflex iC60 4P 2A D', 4, 2],
            ['Reflex iC60 4P 3A D', 4, 3],
            ['Reflex iC60 4P 4A D', 4, 4],
            ['Reflex iC60 4P 6A D', 4, 6],
            ['Reflex iC60 4P 10A D', 4, 10],
            ['Reflex iC60 4P 16A D', 4, 16],
            ['Reflex iC60 4P 20A D', 4, 20],
            ['Reflex iC60 4P 25A D', 4, 25],
            ['Reflex iC60 4P 32A D', 4, 32],
            ['Reflex iC60 4P 40A D', 4, 40],
            ['Reflex iC60 4P 50A D', 4, 50],
            ['Reflex iC60 4P 63A D', 4, 63],
        ];

        foreach ($models as $item) {
            if (!isset($item[0], $item[1], $item[2])) {
                continue;
            }

            $modelName = $item[0];
            $poles = $item[1];
            $nominalCurrent = $item[2];

            $voltage = match ($poles) {
                1 => '230',
                default => '400',
            };

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $cbType?->id ?? 1,
                    'series' => 'Acti9 Reflex iC60',
                    'type' => 'D',
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'trip_curve' => 'D',
                    'breaking_capacity' => 6,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'tripping_time' => $this->getTrippingTime('D'),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'voltage' => $voltage,
                    'voltage_unit_id' => $units['v'] ?? null,
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°c'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°c'] ?? null,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898, IEC 60947-2',
                    'combined_protection' => null,
                ]
            );
        }
    }

    protected function getTrippingTime(string $tripCurve): int
    {
        return match ($tripCurve) {
            'B' => 20,
            'C' => 25,
            'D' => 30,
            'MA' => 35,
            default => 25,
        };
    }
}
