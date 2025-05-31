<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class IK60NSeeder extends Seeder
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

        // Получаем ID типа устройства "CB" (автоматический выключатель)
        $cbType = DeviceType::where('code', 'CB')->first();

        /**
         * Описание:
         * Серия Acti9 iK60N — комбинированные защиты для освещения и промышленных сетей.
         * Номинальный ток: 1–63 A.
         * Количество полюсов: 1P, 2P, 3P, 4P.
         * Кривая срабатывания: C (средняя).
         * Особенности:
         * - Встроенный дистанционный контроль (ARA модули).
         * - Селективность с iDPN/iIDPN.
         * - Используется в системах управления зданиями (BMS).
         */

        $models = [
            // 1P
            ['iK60N 1P C1', 1, 1, 'C'],
            ['iK60N 1P C2', 1, 2, 'C'],
            ['iK60N 1P C3', 1, 3, 'C'],
            ['iK60N 1P C4', 1, 4, 'C'],
            ['iK60N 1P C6', 1, 6, 'C'],
            ['iK60N 1P C10', 1, 10, 'C'],
            ['iK60N 1P C13', 1, 13, 'C'],
            ['iK60N 1P C16', 1, 16, 'C'],
            ['iK60N 1P C20', 1, 20, 'C'],
            ['iK60N 1P C25', 1, 25, 'C'],
            ['iK60N 1P C32', 1, 32, 'C'],
            ['iK60N 1P C40', 1, 40, 'C'],
            ['iK60N 1P C50', 1, 50, 'C'],
            ['iK60N 1P C63', 1, 63, 'C'],

            // 2P
            ['iK60N 2P C2', 2, 2, 'C'],
            ['iK60N 2P C3', 2, 3, 'C'],
            ['iK60N 2P C4', 2, 4, 'C'],
            ['iK60N 2P C6', 2, 6, 'C'],
            ['iK60N 2P C10', 2, 10, 'C'],
            ['iK60N 2P C13', 2, 13, 'C'],
            ['iK60N 2P C16', 2, 16, 'C'],
            ['iK60N 2P C20', 2, 20, 'C'],
            ['iK60N 2P C25', 2, 25, 'C'],
            ['iK60N 2P C32', 2, 32, 'C'],
            ['iK60N 2P C40', 2, 40, 'C'],
            ['iK60N 2P C50', 2, 50, 'C'],
            ['iK60N 2P C63', 2, 63, 'C'],


            // 3P
            ['iK60N 3P C6', 3, 6, 'C'],
            ['iK60N 3P C10', 3, 10, 'C'],
            ['iK60N 3P C13', 3, 13, 'C'],
            ['iK60N 3P C16', 3, 16, 'C'],
            ['iK60N 3P C20', 3, 20, 'C'],
            ['iK60N 3P C25', 3, 25, 'C'],
            ['iK60N 3P C32', 3, 32, 'C'],
            ['iK60N 3P C40', 3, 40, 'C'],
            ['iK60N 3P C50', 3, 50, 'C'],
            ['iK60N 3P C63', 3, 63, 'C'],


            // 4P
            ['iK60N 4P C2', 4, 2, 'C'],
            ['iK60N 4P C3', 4, 3, 'C'],
            ['iK60N 4P C4', 4, 4, 'C'],
            ['iK60N 4P C6', 4, 6, 'C'],
            ['iK60N 4P C10', 4, 10, 'C'],
            ['iK60N 4P C13', 4, 13, 'C'],
            ['iK60N 4P C16', 4, 16, 'C'],
            ['iK60N 4P C20', 4, 20, 'C'],
            ['iK60N 4P C25', 4, 25, 'C'],
            ['iK60N 4P C32', 4, 32, 'C'],
            ['iK60N 4P C40', 4, 40, 'C'],
            ['iK60N 4P C50', 4, 50, 'C'],
            ['iK60N 4P C63', 4, 63, 'C'],
        ];

        foreach ($models as $model) {
            if (!isset($model[0], $model[1], $model[2], $model[3])) {
                continue;
            }

            $modelName = $model[0];
            $poles = $model[1];
            $nominalCurrent = $model[2];
            $tripCurve = $model[3];

            // Определяем напряжение по количеству полюсов
            $voltage = match ($poles) {
                1 => '230',
                default => '400',
            };

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $cbType?->id ?? 1,
                    'series' => 'Acti9 iK60N',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => 6,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'tripping_time' => $this->getTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'rated_diff_current' => null,
                    'rated_diff_current_unit_id' => null,
                    'voltage' => $voltage,
                    'voltage_unit_id' => $units['v'] ?? null,
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ, дистанционное управление',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°c'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°c'] ?? null,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898-1, EN 60898',
                    'rcd_type' => null,
                    'combined_protection' => 'Дистанционное управление (ARA/Reflex)',
                ]
            );

            // Привязка аксессуаров
            $breaker = CircuitBreaker::where('model', $modelName)->first();
            if ($breaker) {
                $accessories = [
                    optional(Accessory::where('model', 'iMX+OF')->first())->id,
                    optional(Accessory::where('model', 'Twido PLC')->first())->id,
                    optional(Accessory::where('model', 'AB1-RV')->first())->id,
                    optional(Accessory::where('model', 'Mechanical Lock')->first())->id,
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
            'K' => 35,
            'Z' => 35,
            default => 25,
        };
    }
}
