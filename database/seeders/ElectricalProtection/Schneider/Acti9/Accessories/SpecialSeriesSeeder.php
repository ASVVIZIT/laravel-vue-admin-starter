<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class SpecialSeriesSeeder extends Seeder
{
    public function run()
    {
        $schneider = Brand::where('name', 'Schneider Electric')->first();
        $units = MeasurementUnit::pluck('id', 'symbol');

        /**
         * Описание:
         * Специальные серии Acti9:
         * - NG125LMA (двигательная защита, кривая MA).
         * - C120H (высокая отключающая способность).
         * - iK60N (комбинированная защита).
         *
         * Поле 'type' включает 'MA' как допустимое значение enum.
         * Поле 'trip_curve' должно быть заполнено отдельно.
         */

        $models = [
            // NG125LMA (двигательная защита)
            ['NG125LMA 2P MA4', 2, 4, 'MA'],
            ['NG125LMA 2P MA6.3', 2, 6.3, 'MA'],
            ['NG125LMA 3P MA10', 3, 10, 'MA'],
            ['NG125LMA 3P MA25', 3, 25, 'MA'],
            ['NG125LMA 4P MA50', 4, 50, 'MA'],

            // C120H (высокая отключающая способность)
            ['C120H 3P B63', 3, 63, 'B'],
            ['C120H 4P C125', 4, 125, 'C'],

            // iK60N (комбинированная защита)
            ['iK60N 3P C32', 3, 32, 'C'],
            ['iK60N 4P C50', 4, 50, 'C'],
        ];

        foreach ($models as $model) {
            $modelName = $model[0];
            $poles = $model[1];
            $nominalCurrent = $model[2];
            $tripCurve = $model[3];

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => 1, // ID типа "Автоматический выключатель"
                    'series' => $this->determineSeries($modelName),
                    'type' => $tripCurve, // Теперь 'MA' допустимо
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['A'],
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => $this->determineBreakingCapacity($modelName),
                    'breaking_capacity_unit_id' => $units['кА'],
                    'tripping_time' => $this->determineTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'],
                    'voltage' => str_contains($modelName, 'NG125LMA') ? '250' : '440',
                    'voltage_unit_id' => $units['V'],
                    'energy_class' => str_contains($modelName, 'NG125LMA') ? 'A-III' : 'A-IV',
                    'ip_rating' => 'IP54',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ (специализированные применения)',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°C'],
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°C'],
                    'pollution_degree' => 'Степень 3',
                    'housing_material' => 'Металл',
                    'standards' => $this->determineStandards($modelName),
                    'combined_protection' => str_contains($modelName, 'NG125LMA') ? 'Двигатели (MA кривая)' : null,
                ]
            );
        }
    }

    protected function determineSeries(string $modelName): string
    {
        return match (true) {
            str_contains($modelName, 'NG125LMA') => 'Acti9 NG125',
            str_contains($modelName, 'C120H') => 'Acti9 C120',
            str_contains($modelName, 'iK60N') => 'Acti9 iK60',
            default => 'Acti9 Special',
        };
    }

    protected function determineBreakingCapacity(string $modelName): float
    {
        return match (true) {
            str_contains($modelName, 'NG125LMA') => 4.0, // Icu=4kA
            str_contains($modelName, 'C120H') => 25.0,  // Icu=25kA
            default => 10.0, // Icu=10kA
        };
    }

    protected function determineTrippingTime(string $tripCurve): int
    {
        return match ($tripCurve) {
            'MA' => 5, // Мгновенное срабатывание
            'D' => 150, // Долгое время срабатывания
            default => 30, // Стандартное время
        };
    }

    protected function determineStandards(string $modelName): string
    {
        return match (true) {
            str_contains($modelName, 'NG125LMA') => 'IEC 60947-2',
            str_contains($modelName, 'iK60N') => 'IEC 60898-1',
            default => 'IEC 60947-2',
        };
    }
}
