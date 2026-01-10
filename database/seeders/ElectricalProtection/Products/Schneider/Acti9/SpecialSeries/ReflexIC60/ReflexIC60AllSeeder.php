<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\SpecialSeries\ReflexIC60;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReflexIC60AllSeeder extends Seeder
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

        // Получаем ID типов устройств
        $cbType = DeviceType::where('code', 'CB')->first()?->id ?? 1;
        $rcboType = DeviceType::where('code', 'RCBO')->first()?->id ?? 1;

        // Полный модельный ряд Reflex iC60 согласно техническим описаниям
        $models = [
            // Кривая B
            ['Reflex iC60 1P 0.5A B', 1, 0.5, 'B'],
            ['Reflex iC60 1P 1A B', 1, 1, 'B'],
            ['Reflex iC60 1P 2A B', 1, 2, 'B'],
            ['Reflex iC60 1P 3A B', 1, 3, 'B'],
            ['Reflex iC60 1P 4A B', 1, 4, 'B'],
            ['Reflex iC60 1P 6A B', 1, 6, 'B'],
            ['Reflex iC60 1P 10A B', 1, 10, 'B'],
            ['Reflex iC60 1P 16A B', 1, 16, 'B'],
            ['Reflex iC60 1P 20A B', 1, 20, 'B'],
            ['Reflex iC60 1P 25A B', 1, 25, 'B'],
            ['Reflex iC60 1P 32A B', 1, 32, 'B'],
            ['Reflex iC60 1P 40A B', 1, 40, 'B'],
            ['Reflex iC60 1P 50A B', 1, 50, 'B'],
            ['Reflex iC60 1P 63A B', 1, 63, 'B'],

            ['Reflex iC60 2P 0.5A B', 2, 0.5, 'B'],
            ['Reflex iC60 2P 1A B', 2, 1, 'B'],
            ['Reflex iC60 2P 2A B', 2, 2, 'B'],
            ['Reflex iC60 2P 3A B', 2, 3, 'B'],
            ['Reflex iC60 2P 4A B', 2, 4, 'B'],
            ['Reflex iC60 2P 6A B', 2, 6, 'B'],
            ['Reflex iC60 2P 10A B', 2, 10, 'B'],
            ['Reflex iC60 2P 16A B', 2, 16, 'B'],
            ['Reflex iC60 2P 20A B', 2, 20, 'B'],
            ['Reflex iC60 2P 25A B', 2, 25, 'B'],
            ['Reflex iC60 2P 32A B', 2, 32, 'B'],
            ['Reflex iC60 2P 40A B', 2, 40, 'B'],
            ['Reflex iC60 2P 50A B', 2, 50, 'B'],
            ['Reflex iC60 2P 63A B', 2, 63, 'B'],

            ['Reflex iC60 3P 0.5A B', 3, 0.5, 'B'],
            ['Reflex iC60 3P 1A B', 3, 1, 'B'],
            ['Reflex iC60 3P 2A B', 3, 2, 'B'],
            ['Reflex iC60 3P 3A B', 3, 3, 'B'],
            ['Reflex iC60 3P 4A B', 3, 4, 'B'],
            ['Reflex iC60 3P 6A B', 3, 6, 'B'],
            ['Reflex iC60 3P 10A B', 3, 10, 'B'],
            ['Reflex iC60 3P 16A B', 3, 16, 'B'],
            ['Reflex iC60 3P 20A B', 3, 20, 'B'],
            ['Reflex iC60 3P 25A B', 3, 25, 'B'],
            ['Reflex iC60 3P 32A B', 3, 32, 'B'],
            ['Reflex iC60 3P 40A B', 3, 40, 'B'],
            ['Reflex iC60 3P 50A B', 3, 50, 'B'],
            ['Reflex iC60 3P 63A B', 3, 63, 'B'],

            ['Reflex iC60 4P 0.5A B', 4, 0.5, 'B'],
            ['Reflex iC60 4P 1A B', 4, 1, 'B'],
            ['Reflex iC60 4P 2A B', 4, 2, 'B'],
            ['Reflex iC60 4P 3A B', 4, 3, 'B'],
            ['Reflex iC60 4P 4A B', 4, 4, 'B'],
            ['Reflex iC60 4P 6A B', 4, 6, 'B'],
            ['Reflex iC60 4P 10A B', 4, 10, 'B'],
            ['Reflex iC60 4P 16A B', 4, 16, 'B'],
            ['Reflex iC60 4P 20A B', 4, 20, 'B'],
            ['Reflex iC60 4P 25A B', 4, 25, 'B'],
            ['Reflex iC60 4P 32A B', 4, 32, 'B'],
            ['Reflex iC60 4P 40A B', 4, 40, 'B'],
            ['Reflex iC60 4P 50A B', 4, 50, 'B'],
            ['Reflex iC60 4P 63A B', 4, 63, 'B'],


            // Кривая C
            ['Reflex iC60 1P 0.5A C', 1, 0.5, 'C'],
            ['Reflex iC60 1P 1A C', 1, 1, 'C'],
            ['Reflex iC60 1P 2A C', 1, 2, 'C'],
            ['Reflex iC60 1P 3A C', 1, 3, 'C'],
            ['Reflex iC60 1P 4A C', 1, 4, 'C'],
            ['Reflex iC60 1P 6A C', 1, 6, 'C'],
            ['Reflex iC60 1P 10A C', 1, 10, 'C'],
            ['Reflex iC60 1P 16A C', 1, 16, 'C'],
            ['Reflex iC60 1P 20A C', 1, 20, 'C'],
            ['Reflex iC60 1P 25A C', 1, 25, 'C'],
            ['Reflex iC60 1P 32A C', 1, 32, 'C'],
            ['Reflex iC60 1P 40A C', 1, 40, 'C'],
            ['Reflex iC60 1P 50A C', 1, 50, 'C'],
            ['Reflex iC60 1P 63A C', 1, 63, 'C'],

            ['Reflex iC60 2P 0.5A C', 2, 0.5, 'C'],
            ['Reflex iC60 2P 1A C', 2, 1, 'C'],
            ['Reflex iC60 2P 2A C', 2, 2, 'C'],
            ['Reflex iC60 2P 3A C', 2, 3, 'C'],
            ['Reflex iC60 2P 4A C', 2, 4, 'C'],
            ['Reflex iC60 2P 6A C', 2, 6, 'C'],
            ['Reflex iC60 2P 10A C', 2, 10, 'C'],
            ['Reflex iC60 2P 16A C', 2, 16, 'C'],
            ['Reflex iC60 2P 20A C', 2, 20, 'C'],
            ['Reflex iC60 2P 25A C', 2, 25, 'C'],
            ['Reflex iC60 2P 32A C', 2, 32, 'C'],
            ['Reflex iC60 2P 40A C', 2, 40, 'C'],
            ['Reflex iC60 2P 50A C', 2, 50, 'C'],
            ['Reflex iC60 2P 63A C', 2, 63, 'C'],

            ['Reflex iC60 3P 0.5A C', 3, 0.5, 'C'],
            ['Reflex iC60 3P 1A C', 3, 1, 'C'],
            ['Reflex iC60 3P 2A C', 3, 2, 'C'],
            ['Reflex iC60 3P 3A C', 3, 3, 'C'],
            ['Reflex iC60 3P 4A C', 3, 4, 'C'],
            ['Reflex iC60 3P 6A C', 3, 6, 'C'],
            ['Reflex iC60 3P 10A C', 3, 10, 'C'],
            ['Reflex iC60 3P 16A C', 3, 16, 'C'],
            ['Reflex iC60 3P 20A C', 3, 20, 'C'],
            ['Reflex iC60 3P 25A C', 3, 25, 'C'],
            ['Reflex iC60 3P 32A C', 3, 32, 'C'],
            ['Reflex iC60 3P 40A C', 3, 40, 'C'],
            ['Reflex iC60 3P 50A C', 3, 50, 'C'],
            ['Reflex iC60 3P 63A C', 3, 63, 'C'],

            ['Reflex iC60 4P 0.5A C', 4, 0.5, 'C'],
            ['Reflex iC60 4P 1A C', 4, 1, 'C'],
            ['Reflex iC60 4P 2A C', 4, 2, 'C'],
            ['Reflex iC60 4P 3A C', 4, 3, 'C'],
            ['Reflex iC60 4P 4A C', 4, 4, 'C'],
            ['Reflex iC60 4P 6A C', 4, 6, 'C'],
            ['Reflex iC60 4P 10A C', 4, 10, 'C'],
            ['Reflex iC60 4P 16A C', 4, 16, 'C'],
            ['Reflex iC60 4P 20A C', 4, 20, 'C'],
            ['Reflex iC60 4P 25A C', 4, 25, 'C'],
            ['Reflex iC60 4P 32A C', 4, 32, 'C'],
            ['Reflex iC60 4P 40A C', 4, 40, 'C'],
            ['Reflex iC60 4P 50A C', 4, 50, 'C'],
            ['Reflex iC60 4P 63A C', 4, 63, 'C'],


            // Кривая D
            ['Reflex iC60 1P 0.5A D', 1, 0.5, 'D'],
            ['Reflex iC60 1P 1A D', 1, 1, 'D'],
            ['Reflex iC60 1P 2A D', 1, 2, 'D'],
            ['Reflex iC60 1P 3A D', 1, 3, 'D'],
            ['Reflex iC60 1P 4A D', 1, 4, 'D'],
            ['Reflex iC60 1P 6A D', 1, 6, 'D'],
            ['Reflex iC60 1P 10A D', 1, 10, 'D'],
            ['Reflex iC60 1P 16A D', 1, 16, 'D'],
            ['Reflex iC60 1P 20A D', 1, 20, 'D'],
            ['Reflex iC60 1P 25A D', 1, 25, 'D'],
            ['Reflex iC60 1P 32A D', 1, 32, 'D'],
            ['Reflex iC60 1P 40A D', 1, 40, 'D'],
            ['Reflex iC60 1P 50A D', 1, 50, 'D'],
            ['Reflex iC60 1P 63A D', 1, 63, 'D'],

            ['Reflex iC60 2P 0.5A D', 2, 0.5, 'D'],
            ['Reflex iC60 2P 1A D', 2, 1, 'D'],
            ['Reflex iC60 2P 2A D', 2, 2, 'D'],
            ['Reflex iC60 2P 3A D', 2, 3, 'D'],
            ['Reflex iC60 2P 4A D', 2, 4, 'D'],
            ['Reflex iC60 2P 6A D', 2, 6, 'D'],
            ['Reflex iC60 2P 10A D', 2, 10, 'D'],
            ['Reflex iC60 2P 16A D', 2, 16, 'D'],
            ['Reflex iC60 2P 20A D', 2, 20, 'D'],
            ['Reflex iC60 2P 25A D', 2, 25, 'D'],
            ['Reflex iC60 2P 32A D', 2, 32, 'D'],
            ['Reflex iC60 2P 40A D', 2, 40, 'D'],
            ['Reflex iC60 2P 50A D', 2, 50, 'D'],
            ['Reflex iC60 2P 63A D', 2, 63, 'D'],

            ['Reflex iC60 3P 0.5A D', 3, 0.5, 'D'],
            ['Reflex iC60 3P 1A D', 3, 1, 'D'],
            ['Reflex iC60 3P 2A D', 3, 2, 'D'],
            ['Reflex iC60 3P 3A D', 3, 3, 'D'],
            ['Reflex iC60 3P 4A D', 3, 4, 'D'],
            ['Reflex iC60 3P 6A D', 3, 6, 'D'],
            ['Reflex iC60 3P 10A D', 3, 10, 'D'],
            ['Reflex iC60 3P 16A D', 3, 16, 'D'],
            ['Reflex iC60 3P 20A D', 3, 20, 'D'],
            ['Reflex iC60 3P 25A D', 3, 25, 'D'],
            ['Reflex iC60 3P 32A D', 3, 32, 'D'],
            ['Reflex iC60 3P 40A D', 3, 40, 'D'],
            ['Reflex iC60 3P 50A D', 3, 50, 'D'],
            ['Reflex iC60 3P 63A D', 3, 63, 'D'],


            // Дифференциальные автоматы (RCBO)
            ['Reflex iC60 1P AC 10mA', 1, 10, 'C', 'AC'],
            ['Reflex iC60 1P AC 30mA', 1, 30, 'C', 'AC'],
            ['Reflex iC60 2P AC 10mA', 2, 10, 'C', 'AC'],
            ['Reflex iC60 2P AC 30mA', 2, 30, 'C', 'AC'],
            ['Reflex iC60 3P AC 10mA', 3, 10, 'C', 'AC'],
            ['Reflex iC60 3P AC 30mA', 3, 30, 'C', 'AC'],
            ['Reflex iC60 4P AC 10mA', 4, 10, 'C', 'AC'],
            ['Reflex iC60 4P AC 30mA', 4, 30, 'C', 'AC'],
        ];

        foreach ($models as $item) {
            // Проверяем, чтобы элементы были доступны
            if (!isset($item[0], $item[1], $item[2], $item[3])) {
                continue; // или выбрасываем исключение/логируем
            }

            $modelName = $item[0];
            $poles = $item[1];
            $nominalCurrent = $item[2];
            $tripCurve = $item[3];
            $typeCode = count($item) > 4 ? $item[4] : null;

            // Определяем тип устройства
            $typeId = $typeCode === 'AC' ? $rcboType : $cbType;

            // Определяем напряжение
            $voltage = match ($poles) {
                1 => '230',
                default => '400',
            };

            // Извлекаем дифференциальный ток
            $ratedDiffCurrent = $typeCode === 'AC' ? explode(' ', $modelName)[3] : null;

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $typeId,
                    'series' => 'Acti9',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => 6,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'tripping_time' => $this->determineTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'voltage' => $voltage,
                    'voltage_unit_id' => $units['v'] ?? null,
                    'energy_class' => 'A-III',
                    'ip_rating' => $typeCode === 'AC' ? 'IP20' : 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°c'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°c'] ?? null,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898, IEC 60947-2',
                    'combined_protection' => $typeCode === 'AC' ? 'Перегрузка, КЗ, Дифференциальная защита' : null,
                    'rated_diff_current' => $ratedDiffCurrent,
                    'rated_diff_current_unit_id' => $typeCode === 'AC' ? $units['ма'] : null,
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
            'MA' => 35,
            default => 25,
        };
    }
}
