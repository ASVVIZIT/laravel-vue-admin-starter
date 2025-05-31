<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\MainCircuitBreakers;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class C60HDCSeeder extends Seeder
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

        $models = [
            ['C60H-DC 1P B0.5', 1, 0.5, 'B', 'B'],
            ['C60H-DC 1P B10', 1, 10, 'B', 'B'],
            ['C60H-DC 2P C20', 2, 20, 'C', 'C'],
            ['C60H-DC 2P C25', 2, 25, 'C', 'C'],
        ];

        $cbType = DeviceType::where('code', 'CB')->first();

        foreach ($models as $model) {
            $breaker = CircuitBreaker::updateOrCreate(
                ['model' => $model[0]],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $cbType->id,
                    'series' => 'Acti9 C60H-DC',
                    'type' => $model[4],
                    'poles' => $model[1],
                    'modular_size' => $model[1] . 'D',
                    'nominal_current' => $model[2],
                    'nominal_current_unit_id' => $units['а'],
                    'trip_curve' => $model[3],
                    'breaking_capacity' => '6',
                    'breaking_capacity_unit_id' => $units['ка'],
                    'tripping_time' => 20,
                    'tripping_time_unit_id' => $units['мс'],
                    'rated_diff_current' => null,
                    'rated_diff_current_unit_id' => null,
                    'voltage' => '1000',
                    'voltage_unit_id' => $units['v dc'],
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°c'],
                    'temperature_range_max' => 55,
                    'temperature_range_max_unit_id' => $units['°c'],
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898',
                    'rcd_type' => null,
                    'combined_protection' => null
                ]
            );
            // Добавляем аксессуары
            $breaker->accessories()->attach([
                Accessory::where('model', 'Aluminum Lug 70mm²')->first()->id,
                Accessory::where('model', 'Plumbed Terminal Caps 2P')->first()->id,
                Accessory::where('model', 'AB1-R0')->first()->id,
            ]);
        }
    }
}
