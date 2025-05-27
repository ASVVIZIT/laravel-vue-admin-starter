<?php

namespace Database\Seeders\ElectricalProtection;

use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class MeasurementUnitSeeder extends Seeder {
    public function run() {
        $units = [
            // Ток
            ['name' => 'Ампер', 'symbol' => 'A', 'physical_quantity' => 'Ток', 'category' => 'current'],
            ['name' => 'КилоАмпер', 'symbol' => 'кА', 'physical_quantity' => 'Ток', 'category' => 'current'],
            ['name' => 'МиллиАмпер', 'symbol' => 'мА', 'physical_quantity' => 'Ток', 'category' => 'current'],

            // Напряжение
            ['name' => 'Вольт', 'symbol' => 'V', 'physical_quantity' => 'Напряжение', 'category' => 'voltage'],
            ['name' => 'Вольт постоянного тока', 'symbol' => 'V DC', 'physical_quantity' => 'Напряжение', 'category' => 'voltage'],

            // Площадь
            ['name' => 'Квадратный миллиметр', 'symbol' => 'мм²', 'physical_quantity' => 'Сечение', 'category' => 'area'],

            // Время
            ['name' => 'Час', 'symbol' => 'ч', 'physical_quantity' => 'Время', 'category' => 'time'],
            ['name' => 'Минута', 'symbol' => 'мин', 'physical_quantity' => 'Время', 'category' => 'time'],
            ['name' => 'Секунда', 'symbol' => 'с', 'physical_quantity' => 'Время', 'category' => 'time'],
            ['name' => 'МиллиСекунда', 'symbol' => 'мс', 'physical_quantity' => 'Время', 'category' => 'time'],

            // Температура
            ['name' => 'Градус Цельсия', 'symbol' => '°C', 'physical_quantity' => 'Температура', 'category' => 'temperature'],
            ['name' => 'Градус Фаренгейта', 'symbol' => '°F', 'physical_quantity' => 'Температура', 'category' => 'temperature'],

            // Дополнительные (для будущих расширений)
            ['name' => 'Штука', 'symbol' => 'шт.', 'physical_quantity' => 'Количество', 'category' => 'quantity'],
            ['name' => 'КилоВатт', 'symbol' => 'кВт', 'physical_quantity' => 'Мощность', 'category' => 'power'],
            ['name' => 'Децибел', 'symbol' => 'dB', 'physical_quantity' => 'Уровень сигнала', 'category' => 'signal'],
            ['name' => 'Ом', 'symbol' => 'Ω', 'physical_quantity' => 'Сопротивление', 'category' => 'resistance'],
            ['name' => 'КилоОм', 'symbol' => 'KΩ', 'physical_quantity' => 'Сопротивление', 'category' => 'resistance'],
            ['name' => 'МегаОм', 'symbol' => 'МΩ', 'physical_quantity' => 'Сопротивление', 'category' => 'resistance'],
        ];

    foreach ($units as $unit) {
            MeasurementUnit::create($unit);
        }
    }
}
