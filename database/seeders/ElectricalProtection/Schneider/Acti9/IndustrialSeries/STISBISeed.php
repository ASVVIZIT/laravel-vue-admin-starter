<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class STISBISeed extends Seeder
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

        /**
         * Описание:
         * Серии Acti9 STI/SBI — комбинированные разъединители-предохранители.
         * Подсерии:
         * - STI: Для промышленных сетей (номиналы 6–63 А)
         * - SBI: Для промышленных нагрузок (номиналы 6–63 А)
         *
         * Характеристики:
         * - Рабочее напряжение: 440 В
         * - Отключающая способность: 6 кА
         * - Кривая срабатывания: B
         * - Тип защиты: Разъединитель + предохранитель
         * - IP20, термопласт, IEC 60947-3
         */

        $models = [
            // STI — комбинированные разъединители-предохранители
            ['STI 1P 6A', 1, 6, 'B'],
            ['STI 1P 10A', 1, 10, 'B'],
            ['STI 1P 16A', 1, 16, 'B'],
            ['STI 1P 20A', 1, 20, 'B'],
            ['STI 1P 25A', 1, 25, 'B'],
            ['STI 1P 32A', 1, 32, 'B'],
            ['STI 1P 40A', 1, 40, 'B'],
            ['STI 1P 50A', 1, 50, 'B'],
            ['STI 1P 63A', 1, 63, 'B'],

            ['STI 2P 6A', 2, 6, 'B'],
            ['STI 2P 10A', 2, 10, 'B'],
            ['STI 2P 16A', 2, 16, 'B'],
            ['STI 2P 20A', 2, 20, 'B'],
            ['STI 2P 25A', 2, 25, 'B'],
            ['STI 2P 32A', 2, 32, 'B'],
            ['STI 2P 40A', 2, 40, 'B'],
            ['STI 2P 50A', 2, 50, 'B'],
            ['STI 2P 63A', 2, 63, 'B'],

            ['STI 3P 10A', 3, 10, 'B'],
            ['STI 3P 16A', 3, 16, 'B'],
            ['STI 3P 20A', 3, 20, 'B'],
            ['STI 3P 25A', 3, 25, 'B'],
            ['STI 3P 32A', 3, 32, 'B'],
            ['STI 3P 40A', 3, 40, 'B'],
            ['STI 3P 50A', 3, 50, 'B'],
            ['STI 3P 63A', 3, 63, 'B'],

            ['STI 4P 16A', 4, 16, 'B'],
            ['STI 4P 20A', 4, 20, 'B'],
            ['STI 4P 25A', 4, 25, 'B'],
            ['STI 4P 32A', 4, 32, 'B'],
            ['STI 4P 40A', 4, 40, 'B'],
            ['STI 4P 50A', 4, 50, 'B'],
            ['STI 4P 63A', 4, 63, 'B'],

            // SBI — комбинированные разъединители-предохранители
            ['SBI 1P 6A', 1, 6, 'B'],
            ['SBI 1P 10A', 1, 10, 'B'],
            ['SBI 1P 16A', 1, 16, 'B'],
            ['SBI 1P 20A', 1, 20, 'B'],
            ['SBI 1P 25A', 1, 25, 'B'],
            ['SBI 1P 32A', 1, 32, 'B'],
            ['SBI 1P 40A', 1, 40, 'B'],
            ['SBI 1P 50A', 1, 50, 'B'],
            ['SBI 1P 63A', 1, 63, 'B'],

            ['SBI 2P 10A', 2, 10, 'B'],
            ['SBI 2P 16A', 2, 16, 'B'],
            ['SBI 2P 20A', 2, 20, 'B'],
            ['SBI 2P 25A', 2, 25, 'B'],
            ['SBI 2P 32A', 2, 32, 'B'],
            ['SBI 2P 40A', 2, 40, 'B'],
            ['SBI 2P 50A', 2, 50, 'B'],
            ['SBI 2P 63A', 2, 63, 'B'],

            ['SBI 3P 16A', 3, 16, 'B'],
            ['SBI 3P 20A', 3, 20, 'B'],
            ['SBI 3P 25A', 3, 25, 'B'],
            ['SBI 3P 32A', 3, 32, 'B'],
            ['SBI 3P 40A', 3, 40, 'B'],
            ['SBI 3P 50A', 3, 50, 'B'],
            ['SBI 3P 63A', 3, 63, 'B'],

            ['SBI 4P 20A', 4, 20, 'B'],
            ['SBI 4P 25A', 4, 25, 'B'],
            ['SBI 4P 32A', 4, 32, 'B'],
            ['SBI 4P 40A', 4, 40, 'B'],
            ['SBI 4P 50A', 4, 50, 'B'],
            ['SBI 4P 63A', 4, 63, 'B'],
        ];

        $cbType = DeviceType::where('code', 'CB')->first();

        foreach ($models as $item) {
            CircuitBreaker::updateOrCreate(
                ['model' => $item[0]],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $cbType->id, // Предполагается, что тип "Автоматический выключатель" уже существует
                    'series' => 'Acti9 STI/SBI',
                    'type' => $item[3],
                    'poles' => $item[1],
                    'modular_size' => $item[1] . 'D',
                    'nominal_current' => $item[2],
                    'nominal_current_unit_id' => $units['а'] ?? null, // Убедитесь, что есть запись с символом "A"
                    'trip_curve' => $item[3],
                    'breaking_capacity' => 6, // Icu=6kA
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'voltage' => '440',
                    'voltage_unit_id' => $units['v'] ?? null,
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP20',
                    'terminal_type' => 'Винтовой',
                    'protection' => 'Защита от перегрузки и короткого замыкания',
                    'temperature_range_min' => -5,
                    'temperature_range_min_unit_id' => $units['°c'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°c'] ?? null,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60947-3',
                    'combined_protection' => 'Разъединитель + предохранитель',
                ]
            );
        }
    }
}
