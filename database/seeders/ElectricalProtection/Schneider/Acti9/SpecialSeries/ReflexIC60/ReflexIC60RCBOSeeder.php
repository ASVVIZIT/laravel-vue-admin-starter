<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\ReflexIC60;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use App\Models\ElectricalProtection\Accessory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReflexIC60RCBOSeeder extends Seeder
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
        $rcboType = DeviceType::where('code', 'RCBO')->first();

        $models = [
            ['Reflex iC60 1P AC 10mA', 1, 10, 'C'],
            ['Reflex iC60 1P AC 30mA', 1, 30, 'C'],
            ['Reflex iC60 2P AC 10mA', 2, 10, 'C'],
            ['Reflex iC60 2P AC 30mA', 2, 30, 'C'],
            ['Reflex iC60 3P AC 10mA', 3, 10, 'C'],
            ['Reflex iC60 3P AC 30mA', 3, 30, 'C'],
            ['Reflex iC60 4P AC 10mA', 4, 10, 'C'],
            ['Reflex iC60 4P AC 30mA', 4, 30, 'C'],
        ];

        foreach ($models as $item) {
            if (!isset($item[0], $item[1], $item[2], $item[3])) {
                continue;
            }

            $modelName = $item[0];
            $poles = $item[1];
            $ratedDiffCurrent = $item[2];
            $tripCurve = $item[3];

            $voltage = match ($poles) {
                1 => '230',
                default => '400',
            };

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $rcboType?->id ?? 3, // id 3 RCBO
                    'series' => 'Acti9 Reflex iC60',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $ratedDiffCurrent / 10 * 10, // Для RCBO номинальный ток = диф. ток
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => 6,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'tripping_time' => $this->getTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'voltage' => $voltage,
                    'voltage_unit_id' => $units['v'] ?? null,
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP20',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Перегрузка, КЗ, Дифференциальная защита',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°c'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°c'] ?? null,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898, IEC 60947-2',
                    'combined_protection' => 'Дифференциальная защита',
                    'rated_diff_current' => $ratedDiffCurrent,
                    'rated_diff_current_unit_id' => $units['ма'] ?? null,
                ]
            );

            // Связь с аксессуарами
            $breaker = CircuitBreaker::where('model', $modelName)->first();
            if ($breaker) {
                $accessories = [
                    optional(Accessory::where('model', 'ARA iC60')->first())->id,
                    optional(Accessory::where('model', 'Ti24 Interface Module')->first())->id,
                    optional(Accessory::where('model', 'iOF/SD+OF')->first())->id,
                    optional(Accessory::where('model', 'iMX Расцепитель')->first())->id,
                    optional(Accessory::where('model', 'Vigi iC60 30mA')->first())->id,
                ];
                $breaker->accessories()->sync(array_filter($accessories));
            }
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
