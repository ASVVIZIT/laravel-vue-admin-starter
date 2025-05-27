<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\MainCircuitBreakers;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class IC60HSeeder extends Seeder
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

        $units = MeasurementUnit::pluck('id', 'symbol');

        // Получаем ID типа устройства "RCBO" и "RCM"
        $rcboType = DeviceType::where('code', 'RCBO')->first();
        $rcmType = DeviceType::where('code', 'RCM')->first();

        if (!$rcboType) {
            $rcboType = DeviceType::create([
                'code' => 'RCBO',
                'name' => 'Дифференциальный автомат',
                'description' => 'Комбинированная защита: перегрузка + КЗ + УЗО',
            ]);
        }

        if (!$rcmType) {
            $rcmType = DeviceType::create([
                'code' => 'RCM',
                'name' => 'Дифференциальный модуль',
                'description' => 'Модуль дифференциальной защиты, совместимый с автоматами',
            ]);
        }

        /**
         * Описание:
         * Серия Acti9 iC60H — автоматы с высокой отключающей способностью.
         * Номинальный ток: 0.5–63 A.
         * Количество полюсов: 1P, 2P, 3P, 4P.
         * Кривые срабатывания: B (быстрая), C (средняя), D (медленная).
         * Также поддерживаются RCBO и RCM.
         */

        $models = [
            // B-кривая
            ['iC60H 1P B0.5', 1, 0.5, 'B', 'B'],
            ['iC60H 1P B1', 1, 1, 'B', 'B'],
            ['iC60H 1P B2', 1, 2, 'B', 'B'],
            ['iC60H 1P B3', 1, 3, 'B', 'B'],
            ['iC60H 1P B4', 1, 4, 'B', 'B'],
            ['iC60H 1P B6', 1, 6, 'B', 'B'],
            ['iC60H 1P B10', 1, 10, 'B', 'B'],
            ['iC60H 1P B13', 1, 13, 'B', 'B'],
            ['iC60H 1P B16', 1, 16, 'B', 'B'],
            ['iC60H 1P B20', 1, 20, 'B', 'B'],
            ['iC60H 1P B25', 1, 25, 'B', 'B'],
            ['iC60H 1P B32', 1, 32, 'B', 'B'],
            ['iC60H 1P B40', 1, 40, 'B', 'B'],
            ['iC60H 1P B50', 1, 50, 'B', 'B'],
            ['iC60H 1P B63', 1, 63, 'B', 'B'],

            ['iC60H 2P B10', 2, 10, 'B', 'B'],
            ['iC60H 2P B13', 2, 13, 'B', 'B'],
            ['iC60H 2P B16', 2, 16, 'B', 'B'],
            ['iC60H 2P B20', 2, 20, 'B', 'B'],
            ['iC60H 2P B25', 2, 25, 'B', 'B'],
            ['iC60H 2P B32', 2, 32, 'B', 'B'],
            ['iC60H 2P B40', 2, 40, 'B', 'B'],
            ['iC60H 2P B50', 2, 50, 'B', 'B'],
            ['iC60H 2P B63', 2, 63, 'B', 'B'],

            ['iC60H 3P B20', 3, 20, 'B', 'B'],
            ['iC60H 3P B25', 3, 25, 'B', 'B'],
            ['iC60H 3P B32', 3, 32, 'B', 'B'],
            ['iC60H 3P B40', 3, 40, 'B', 'B'],
            ['iC60H 3P B50', 3, 50, 'B', 'B'],
            ['iC60H 3P B63', 3, 63, 'B', 'B'],

            ['iC60H 4P B25', 4, 25, 'B', 'B'],
            ['iC60H 4P B32', 4, 32, 'B', 'B'],
            ['iC60H 4P B40', 4, 40, 'B', 'B'],
            ['iC60H 4P B50', 4, 50, 'B', 'B'],
            ['iC60H 4P B63', 4, 63, 'B', 'B'],


            // C-кривая
            ['iC60H 1P C0.5', 1, 0.5, 'C', 'C'],
            ['iC60H 1P C1', 1, 1, 'C', 'C'],
            ['iC60H 1P C2', 1, 2, 'C', 'C'],
            ['iC60H 1P C3', 1, 3, 'C', 'C'],
            ['iC60H 1P C4', 1, 4, 'C', 'C'],
            ['iC60H 1P C6', 1, 6, 'C', 'C'],
            ['iC60H 1P C10', 1, 10, 'C', 'C'],
            ['iC60H 1P C13', 1, 13, 'C', 'C'],
            ['iC60H 1P C16', 1, 16, 'C', 'C'],
            ['iC60H 1P C20', 1, 20, 'C', 'C'],
            ['iC60H 1P C25', 1, 25, 'C', 'C'],
            ['iC60H 1P C32', 1, 32, 'C', 'C'],
            ['iC60H 1P C40', 1, 40, 'C', 'C'],
            ['iC60H 1P C50', 1, 50, 'C', 'C'],
            ['iC60H 1P C63', 1, 63, 'C', 'C'],

            ['iC60H 2P C20', 2, 20, 'C', 'C'],
            ['iC60H 2P C25', 2, 25, 'C', 'C'],
            ['iC60H 2P C32', 2, 32, 'C', 'C'],
            ['iC60H 2P C40', 2, 40, 'C', 'C'],
            ['iC60H 2P C50', 2, 50, 'C', 'C'],
            ['iC60H 2P C63', 2, 63, 'C', 'C'],

            ['iC60H 3P C25', 3, 25, 'C', 'AC'],
            ['iC60H 3P C32', 3, 32, 'C', 'AC'],
            ['iC60H 3P C40', 3, 40, 'C', 'AC'],
            ['iC60H 3P C50', 3, 50, 'C', 'AC'],
            ['iC60H 3P C63', 3, 63, 'C', 'AC'],

            ['iC60H 4P C32', 4, 32, 'C', 'AC'],
            ['iC60H 4P C40', 4, 40, 'C', 'AC'],
            ['iC60H 4P C50', 4, 50, 'C', 'AC'],
            ['iC60H 4P C63', 4, 63, 'C', 'AC'],


            // D-кривая
            ['iC60H 1P D0.5', 1, 0.5, 'D', 'D'],
            ['iC60H 1P D1', 1, 1, 'D', 'D'],
            ['iC60H 1P D2', 1, 2, 'D', 'D'],
            ['iC60H 1P D3', 1, 3, 'D', 'D'],
            ['iC60H 1P D4', 1, 4, 'D', 'D'],
            ['iC60H 1P D6', 1, 6, 'D', 'D'],
            ['iC60H 1P D10', 1, 10, 'D', 'D'],
            ['iC60H 1P D13', 1, 13, 'D', 'D'],
            ['iC60H 1P D16', 1, 16, 'D', 'D'],
            ['iC60H 1P D20', 1, 20, 'D', 'D'],
            ['iC60H 1P D25', 1, 25, 'D', 'D'],
            ['iC60H 1P D32', 1, 32, 'D', 'D'],
            ['iC60H 1P D40', 1, 40, 'D', 'D'],
            ['iC60H 1P D50', 1, 50, 'D', 'D'],
            ['iC60H 1P D63', 1, 63, 'D', 'D'],

            ['iC60H 2P D20', 2, 20, 'D', 'D'],
            ['iC60H 2P D25', 2, 25, 'D', 'D'],
            ['iC60H 2P D32', 2, 32, 'D', 'D'],
            ['iC60H 2P D40', 2, 40, 'D', 'D'],
            ['iC60H 2P D50', 2, 50, 'D', 'D'],
            ['iC60H 2P D63', 2, 63, 'D', 'D'],

            ['iC60H 3P D25', 3, 25, 'D', 'D'],
            ['iC60H 3P D32', 3, 32, 'D', 'D'],
            ['iC60H 3P D40', 3, 40, 'D', 'D'],
            ['iC60H 3P D50', 3, 50, 'D', 'D'],
            ['iC60H 3P D63', 3, 63, 'D', 'D'],

            ['iC60H 4P D32', 4, 32, 'D', 'D'],
            ['iC60H 4P D40', 4, 40, 'D', 'D'],
            ['iC60H 4P D50', 4, 50, 'D', 'D'],
            ['iC60H 4P D63', 4, 63, 'D', 'D'],
        ];

        foreach ($models as $model) {
            $modelName = $model[0];
            $poles = $model[1];
            $nominalCurrent = $model[2];
            $tripCurve = $model[3];
            $deviceCode = $model[4];

            // Определяем тип устройства
            $typeId = match ($deviceCode) {
                'AC' => $rcboType->id,
                default => 1, // Автоматический выключатель (CB)
            };

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => $typeId,
                    'series' => 'Acti9 iC60H',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['A'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => match($tripCurve) {
                        'B', 'C', 'D' => 10,
                        default => 10,
                    },
                    'breaking_capacity_unit_id' => $units['кА'] ?? null,
                    'tripping_time' => $this->getTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ?? null,
                    'rated_diff_current' => $deviceCode === 'AC' ? 300 : null, // Пример: 300 mA
                    'voltage' => $this->getVoltageByPoles($poles),
                    'voltage_unit_id' => $units['V'] ?? null,
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => $units['°C'] ?? null,
                    'temperature_range_max' => 70,
                    'temperature_range_max_unit_id' => $units['°C'] ?? null,
                    'pollution_degree' => 'Степень 3',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898, IEC 60947-2',
                    'rcd_type' => $deviceCode === 'AC' ? 'AC' : null,
                    'combined_protection' => $deviceCode === 'AC' ? 'Дифференциальная защита' : null,
                ]
            );
        }

        // Привязываем общие аксессуары ко всем автоматам
        $breakerList = CircuitBreaker::whereIn('model', array_column($models, 0))->get();

        foreach ($breakerList as $breaker) {
            $accessories = [
                optional(Accessory::where('model', 'ARA iC60')->first())->id,
                optional(Accessory::where('model', 'Vigi iC60 100mA')->first())->id,
                optional(Accessory::where('model', 'Mechanical Lock')->first())->id,
                optional(Accessory::where('model', 'AB1-GA')->first())->id,
                optional(Accessory::where('model', 'PZ1 Spacer')->first())->id,
            ];

            $breaker->accessories()->sync(array_filter($accessories));
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
            'D' => 30,
            default => 25,
        };
    }
}
