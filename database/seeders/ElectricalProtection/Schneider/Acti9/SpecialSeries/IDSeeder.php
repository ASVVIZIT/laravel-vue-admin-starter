<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries;

use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class IDSeeder extends Seeder
{
    public function run()
    {
        $brand = Brand::where('name', 'Schneider Electric')->first();
        $units = MeasurementUnit::all()->mapWithKeys(function ($unit) {
            return [
                Str::lower($unit->symbol) => $unit->id,
                Str::lower($unit->name) => $unit->id // Добавляем поиск по названиям
            ];
        });

        // Создаем недостающие единицы измерения
        if (!isset($units['а'])) {
            $ampereUnit = MeasurementUnit::updateOrCreate(
                ['symbol' => 'А'],
                ['name' => 'Ампер', 'description' => 'Единица измерения тока']
            );
            $units['а'] = $ampereUnit->id;
        }

        if (!isset($units['ма'])) {
            $milliAmpereUnit = MeasurementUnit::updateOrCreate(
                ['symbol' => 'мА'],
                ['name' => 'Миллиампер', 'description' => 'Единица измерения тока утечки']
            );
            $units['ма'] = $milliAmpereUnit->id;
        }

        if (!$brand) {
            $brand = Brand::create([
                'name' => 'Schneider Electric',
                'country' => 'Франция',
                'website' => 'https://www.se.com',
                'description' => 'Мировой лидер в области автоматизации и управления энергией',
            ]);
        }

        // Получаем типы устройств
        $rcboType = DeviceType::where('code', 'RCBO')->first();
        $rcdType = DeviceType::where('code', 'RCD')->first();

        // Создаем типы если их нет
        if (!$rcboType) {
            $rcboType = DeviceType::updateOrCreate([
                'code' => 'RCBO',
                'name' => 'Дифференциальный автомат',
                'description' => 'Комбинированная защита (автомат + УЗО)',
            ]);
        }

        if (!$rcdType) {
            $rcdType = DeviceType::updateOrCreate([
                'code' => 'RCD',
                'name' => 'УЗО',
                'description' => 'Дифференциальная защита от тока утечки',
            ]);
        }

        // Модели с указанием типа устройства
        $models = [
            // RCBO модели (дифференциальные автоматы)
            ['iID 1P 10mA', 1, 10, 'C', 'RCBO'],
            ['iID 1P 30mA', 1, 30, 'C', 'RCBO'],
            ['iID 2P 10mA', 2, 10, 'C', 'RCBO'],
            ['iID 2P 30mA', 2, 30, 'C', 'RCBO'],
            ['iID 3P 10mA', 3, 10, 'C', 'RCBO'],
            ['iID 3P 30mA', 3, 30, 'C', 'RCBO'],
            ['iID 4P 10mA', 4, 10, 'C', 'RCBO'],
            ['iID 4P 30mA', 4, 30, 'C', 'RCBO'],

            // RCD модели (УЗО)
            ['RCCB-ID 125A', 4, 125, null, 'RCD'],
            ['RCCB-ID 80A', 4, 80, null, 'RCD'],
            ['RCCB-ID 63A', 4, 63, null, 'RCD'],
            ['RCCB-ID 50A', 4, 50, null, 'RCD'],
            ['RCCB-ID 40A', 4, 40, null, 'RCD'],
            ['RCCB-ID 32A', 4, 32, null, 'RCD'],
            ['RCCB-ID 25A', 4, 25, null, 'RCD'],
            ['RCCB-ID 20A', 4, 20, null, 'RCD'],
            ['RCCB-ID 16A', 4, 16, null, 'RCD'],
            ['RCCB-ID 13A', 4, 13, null, 'RCD'],
            ['RCCB-ID 10A', 4, 10, null, 'RCD'],
        ];

        foreach ($models as $item) {
            [$model, $poles, $current, $curve, $type] = $item;

            $baseData = [
                'brand_id' => $brand->id,
                'series' => 'Acti9 iID',
                'poles' => $poles,
                'modular_size' => $poles . 'D',
                'ip_rating' => 'IP40',
                'terminal_type' => 'Винтовой с защёлкой',
                'standards' => 'IEC 60947-2',
                'voltage' => $poles > 1 ? '400' : '230',
                'voltage_unit_id' => $units['v'] ?? null,
            ];

            // Данные для RCBO (дифференциальные автоматы)
            if ($type === 'RCBO') {
                $data = array_merge($baseData, [
                    'type_id' => $rcboType->id,
                    'type' => $curve,
                    'nominal_current' => 16, // Типовое значение для автомата
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'rated_diff_current' => $current,
                    'rated_diff_current_unit_id' => $units['ма'] ?? null,
                    'trip_curve' => $curve,
                    'breaking_capacity' => 6,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                    'protection' => 'Дифференциальная защита, перегрузка, КЗ',
                    'combined_protection' => 'Диф. защита',
                ]);
            }
            // Данные для RCD (УЗО)
            else {
                $data = array_merge($baseData, [
                    'type_id' => $rcdType->id,
                    'nominal_current' => $current,
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'rated_diff_current' => 30, // Стандартное значение для УЗО
                    'rated_diff_current_unit_id' => $units['ма'] ?? null,
                    'protection' => 'Дифференциальная защита',
                    'combined_protection' => '',
                    'trip_curve' => '',
                    'breaking_capacity' => 0,
                    'breaking_capacity_unit_id' => $units['ка'] ?? null,
                ]);
            }

            $breaker = CircuitBreaker::updateOrCreate(
                ['model' => $model],
                $data
            );

            $accessories = [
                optional(Accessory::where('model', 'Ti24 Interface Module')->first())->id,
                optional(Accessory::where('model', 'Plumbed Terminal Caps 3P')->first())->id,
            ];

            $breaker->accessories()->sync(array_filter($accessories));
        }
    }
}
