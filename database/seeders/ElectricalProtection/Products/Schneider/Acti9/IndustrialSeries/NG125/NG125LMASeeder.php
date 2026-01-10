<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\IndustrialSeries\NG125;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NG125LMASeeder extends Seeder
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

        if (!$cbType) {
            $cbType = DeviceType::updateOrCreate([
                'code' => 'CB',
                'name' => 'Автоматический выключатель',
                'description' => 'Защита от перегрузки и КЗ',
            ]);
        }

        $models = [
            ['NG125LMA 2P MA4', 2, 4, 'MA'],
            ['NG125LMA 2P MA6.3', 2, 6.3, 'MA'],
            ['NG125LMA 2P MA10', 2, 10, 'MA'],
            ['NG125LMA 2P MA16', 2, 16, 'MA'],
            ['NG125LMA 2P MA25', 2, 25, 'MA'],
            ['NG125LMA 2P MA40', 2, 40, 'MA'],
            ['NG125LMA 2P MA50', 2, 50, 'MA'],
            ['NG125LMA 2P MA63', 2, 63, 'MA'],
            ['NG125LMA 2P MA80', 2, 80, 'MA'],


            ['NG125LMA 3P MA4', 3, 4, 'MA'],
            ['NG125LMA 3P MA6.3', 3, 6.3, 'MA'],
            ['NG125LMA 3P MA10', 3, 10, 'MA'],
            ['NG125LMA 3P MA16', 3, 16, 'MA'],
            ['NG125LMA 3P MA25', 3, 25, 'MA'],
            ['NG125LMA 3P MA40', 3, 40, 'MA'],
            ['NG125LMA 3P MA50', 3, 50, 'MA'],
            ['NG125LMA 3P MA63', 3, 63, 'MA'],
            ['NG125LMA 3P MA80', 3, 80, 'MA'],
        ];

        foreach ($models as $item) {
            $modelName = $item[0];
            $poles = $item[1];
            $nominalCurrent = $item[2];
            $tripCurve = $item[3];

            $voltage = match ($poles) {
                1 => '230',
                default => '400',
            };

            CircuitBreaker::updateOrCreate(
                ['model' => $modelName],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $cbType->id,
                    'series' => 'Acti9 NG125LMA',
                    'type' => $tripCurve,
                    'poles' => $poles,
                    'modular_size' => $poles . 'D',
                    'nominal_current' => $nominalCurrent,
                    'nominal_current_unit_id' => $units['а'] ?? null,
                    'trip_curve' => $tripCurve,
                    'breaking_capacity' => 25,
                    'breaking_capacity_unit_id' => $units['ка'] ??null,
                    'tripping_time' => $this->determineTrippingTime($tripCurve),
                    'tripping_time_unit_id' => $units['мс'] ??null,
                    'rated_diff_current' => null,
                    'rated_diff_current_Unit_id' => $units['ма'] ??null,
                    'voltage' => $voltage,
                    'voltage_Unit_id' => $units['v'] ??null,
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -10,
                    'temperature_range_min_Unit_id' => $units['°c'] ??null,
                    'temperature_range_max' => 60,
                    'temperature_range_max_Unit_id' => $units['°c'] ??null,
                    'pollution_degree' => 'Степень 3',
                    'housing_material' => 'Пластик',
                    'standards' => 'IEC 60947-2',
                    'rcd_type' => null,
                    'combined_protection' =>null,
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
