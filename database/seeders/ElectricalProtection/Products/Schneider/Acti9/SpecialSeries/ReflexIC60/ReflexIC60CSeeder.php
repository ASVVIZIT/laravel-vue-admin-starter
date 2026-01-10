<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\SpecialSeries\ReflexIC60;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReflexIC60CSeeder extends Seeder
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

        $models = [
            ['Reflex iC60 1P 0.5A C', 1, 0.5],
            ['Reflex iC60 1P 1A C', 1, 1],
            ['Reflex iC60 1P 2A C', 1, 2],
            ['Reflex iC60 1P 3A C', 1, 3],
            ['Reflex iC60 1P 4A C', 1, 4],
            ['Reflex iC60 1P 6A C', 1, 6],
            ['Reflex iC60 1P 10A C', 1, 10],
            ['Reflex iC60 1P 16A C', 1, 16],
            ['Reflex iC60 1P 20A C', 1, 20],
            ['Reflex iC60 1P 25A C', 1, 25],
            ['Reflex iC60 1P 32A C', 1, 32],
            ['Reflex iC60 1P 40A C', 1, 40],
            ['Reflex iC60 1P 50A C', 1, 50],
            ['Reflex iC60 1P 63A C', 1, 63],


            ['Reflex iC60 2P 0.5A C', 2, 0.5],
            ['Reflex iC60 2P 1A C', 2, 1],
            ['Reflex iC60 2P 2A C', 2, 2],
            ['Reflex iC60 2P 3A C', 2, 3],
            ['Reflex iC60 2P 4A C', 2, 4],
            ['Reflex iC60 2P 6A C', 2, 6],
            ['Reflex iC60 2P 10A C', 2, 10],
            ['Reflex iC60 2P 16A C', 2, 16],
            ['Reflex iC60 2P 20A C', 2, 20],
            ['Reflex iC60 2P 25A C', 2, 25],
            ['Reflex iC60 2P 32A C', 2, 32],
            ['Reflex iC60 2P 40A C', 2, 40],
            ['Reflex iC60 2P 50A C', 2, 50],
            ['Reflex iC60 2P 63A C', 2, 63],


            ['Reflex iC60 3P 0.5A C', 3, 0.5],
            ['Reflex iC60 3P 1A C', 3, 1],
            ['Reflex iC60 3P 2A C', 3, 2],
            ['Reflex iC60 3P 3A C', 3, 3],
            ['Reflex iC60 3P 4A C', 3, 4],
            ['Reflex iC60 3P 6A C', 3, 6],
            ['Reflex iC60 3P 10A C', 3, 10],
            ['Reflex iC60 3P 16A C', 3, 16],
            ['Reflex iC60 3P 20A C', 3, 20],
            ['Reflex iC60 3P 25A C', 3, 25],
            ['Reflex iC60 3P 32A C', 3, 32],
            ['Reflex iC60 3P 40A C', 3, 40],
            ['Reflex iC60 3P 50A C', 3, 50],
            ['Reflex iC60 3P 63A C', 3, 63],


            ['Reflex iC60 4P 0.5A C', 4, 0.5],
            ['Reflex iC60 4P 1A C', 4, 1],
            ['Reflex iC60 4P 2A C', 4, 2],
            ['Reflex iC60 4P 3A C', 4, 3],
            ['Reflex iC60 4P 4A C', 4, 4],
            ['Reflex iC60 4P 6A C', 4, 6],
            ['Reflex iC60 4P 10A C', 4, 10],
            ['Reflex iC60 4P 16A C', 4, 16],
            ['Reflex iC60 4P 20A C', 4, 20],
            ['Reflex iC60 4P 25A C', 4, 25],
            ['Reflex iC60 4P 32A C', 4, 32],
            ['Reflex iC60 4P 40A C', 4, 40],
            ['Reflex iC60 4P 50A C', 4, 50],
            ['Reflex iC60 4P 63A C', 4, 63],
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
                    'type' => 'C',
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'trip_curve' => 'C',
                    'breaking_capacity' => 6,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'tripping_time' => $this->getTrippingTime('C'),
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
