<?php

namespace Database\Seeders\ElectricalProtection;

use App\Models\ElectricalProtection\MeasurementCategory;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Database\Seeder;

class MeasurementUnitSeeder extends Seeder
{
    public function run()
    {
        // Очистка таблиц
        MeasurementUnit::query()->delete();
        MeasurementCategory::query()->delete();

        // Создаем категории измерений
        $categories = [
            ['name' => 'current', 'description' => 'Единицы измерения электрического тока'],
            ['name' => 'voltage', 'description' => 'Единицы измерения электрического напряжения'],
            ['name' => 'area', 'description' => 'Единицы измерения площади сечения'],
            ['name' => 'time', 'description' => 'Единицы измерения времени'],
            ['name' => 'temperature', 'description' => 'Единицы измерения температуры'],
            ['name' => 'quantity', 'description' => 'Единицы измерения количества'],
            ['name' => 'power', 'description' => 'Единицы измерения мощности'],
            ['name' => 'signal', 'description' => 'Единицы измерения уровня сигнала'],
            ['name' => 'resistance', 'description' => 'Единицы измерения сопротивления'],
            ['name' => 'frequency', 'description' => 'Единицы измерения частоты'],
            ['name' => 'capacitance', 'description' => 'Единицы измерения емкости'],
            ['name' => 'length', 'description' => 'Единицы измерения длины'],
        ];


        $createdCategories = [];
        foreach ($categories as $category) {
            $createdCategories[$category['name']] = MeasurementCategory::create($category);
        }

        // Создаем единицы измерений
        $units = [
            // Ток
            ['name' => 'Ампер', 'symbol' => 'а', 'display_symbol' => 'А', 'physical_quantity' => 'Ток', 'category' => 'current'],
            ['name' => 'КилоАмпер', 'symbol' => 'ка', 'display_symbol' => 'кА', 'physical_quantity' => 'Ток', 'category' => 'current'],
            ['name' => 'МиллиАмпер', 'symbol' => 'ма', 'display_symbol' => 'мА', 'physical_quantity' => 'Ток', 'category' => 'current'],
            ['name' => 'МикроАмпер', 'symbol' => 'мка', 'display_symbol' => 'мкА', 'physical_quantity' => 'Ток', 'category' => 'current'],

            // Напряжение
            ['name' => 'Вольт', 'symbol' => 'v', 'display_symbol' => 'V', 'physical_quantity' => 'Напряжение', 'category' => 'voltage'],
            ['name' => 'Вольт постоянного тока', 'symbol' => 'v dc', 'display_symbol' => 'V DC', 'physical_quantity' => 'Напряжение', 'category' => 'voltage'],
            ['name' => 'КилоВольт', 'symbol' => 'кв', 'display_symbol' => 'кВ', 'physical_quantity' => 'Напряжение', 'category' => 'voltage'],
            ['name' => 'МиллиВольт', 'symbol' => 'мв', 'display_symbol' => 'мВ', 'physical_quantity' => 'Напряжение', 'category' => 'voltage'],

            // Площадь
            ['name' => 'Квадратный миллиметр', 'symbol' => 'мм2', 'display_symbol' => 'мм²', 'physical_quantity' => 'Сечение', 'category' => 'area'],
            ['name' => 'Квадратный сантиметр', 'symbol' => 'см2', 'display_symbol' => 'см²', 'physical_quantity' => 'Сечение', 'category' => 'area'],
            ['name' => 'Круглый миллиметр', 'symbol' => 'крмм', 'display_symbol' => 'кр.мм', 'physical_quantity' => 'Сечение', 'category' => 'area'],

            // Время
            ['name' => 'Час', 'symbol' => 'ч', 'display_symbol' => 'ч', 'physical_quantity' => 'Время', 'category' => 'time'],
            ['name' => 'Минута', 'symbol' => 'мин', 'display_symbol' => 'мин', 'physical_quantity' => 'Время', 'category' => 'time'],
            ['name' => 'Секунда', 'symbol' => 'с', 'display_symbol' => 'с', 'physical_quantity' => 'Время', 'category' => 'time'],
            ['name' => 'МиллиСекунда', 'symbol' => 'мс', 'display_symbol' => 'мс', 'physical_quantity' => 'Время', 'category' => 'time'],
            ['name' => 'МикроСекунда', 'symbol' => 'мкс', 'display_symbol' => 'мкс', 'physical_quantity' => 'Время', 'category' => 'time'],

            // Температура
            ['name' => 'Градус Цельсия', 'symbol' => '°c', 'display_symbol' => '°C', 'physical_quantity' => 'Температура', 'category' => 'temperature'],
            ['name' => 'Градус Фаренгейта', 'symbol' => '°f', 'display_symbol' => '°F', 'physical_quantity' => 'Температура', 'category' => 'temperature'],
            ['name' => 'Градус Кельвин', 'symbol' => '°k', 'display_symbol' => 'K', 'physical_quantity' => 'Температура', 'category' => 'temperature'],

            // Количество
            ['name' => 'Штука', 'symbol' => 'шт.', 'display_symbol' => 'шт.', 'physical_quantity' => 'Количество', 'category' => 'quantity'],
            ['name' => 'Процент', 'symbol' => '%', 'display_symbol' => '%', 'physical_quantity' => 'Доля', 'category' => 'quantity'],
            ['name' => 'Упаковка', 'symbol' => 'упак.', 'display_symbol' => 'Упак.', 'physical_quantity' => 'Упаковка', 'category' => 'quantity'],

            // Мощность
            ['name' => 'КилоВатт', 'symbol' => 'квт', 'display_symbol' => 'кВт', 'physical_quantity' => 'Мощность', 'category' => 'power'],
            ['name' => 'Ватт', 'symbol' => 'вт', 'display_symbol' => 'Вт', 'physical_quantity' => 'Мощность', 'category' => 'power'],
            ['name' => 'Мегаватт', 'symbol' => 'мвт', 'display_symbol' => 'МВт', 'physical_quantity' => 'Мощность', 'category' => 'power'],

            // Уровень сигнала
            ['name' => 'Децибел', 'symbol' => 'дб', 'display_symbol' => 'dB', 'physical_quantity' => 'Уровень сигнала', 'category' => 'signal'],
            ['name' => 'Децибел-милливатт', 'symbol' => 'дбм', 'display_symbol' => 'дБм', 'physical_quantity' => 'Мощность сигнала', 'category' => 'signal'],

            // Сопротивление
            ['name' => 'Ом', 'symbol' => 'ом', 'display_symbol' => 'Ω', 'physical_quantity' => 'Сопротивление', 'category' => 'resistance'],
            ['name' => 'КилоОм', 'symbol' => 'ком', 'display_symbol' => 'кΩ', 'physical_quantity' => 'Сопротивление', 'category' => 'resistance'],
            ['name' => 'МегаОм', 'symbol' => 'мом', 'display_symbol' => 'МΩ', 'physical_quantity' => 'Сопротивление', 'category' => 'resistance'],
            ['name' => 'Миллиом', 'symbol' => 'миллом', 'display_symbol' => 'мΩ', 'physical_quantity' => 'Сопротивление', 'category' => 'resistance'],

            // Частота
            ['name' => 'Герц', 'symbol' => 'гц', 'display_symbol' => 'Гц', 'physical_quantity' => 'Частота', 'category' => 'frequency'],
            ['name' => 'Килогерц', 'symbol' => 'кгц', 'display_symbol' => 'кГц', 'physical_quantity' => 'Частота', 'category' => 'frequency'],
            ['name' => 'Мегагерц', 'symbol' => 'мгц', 'display_symbol' => 'МГц', 'physical_quantity' => 'Частота', 'category' => 'frequency'],

            // Емкость
            ['name' => 'Фарад', 'symbol' => 'ф', 'display_symbol' => 'Ф', 'physical_quantity' => 'Емкость', 'category' => 'capacitance'],
            ['name' => 'Микрофарад', 'symbol' => 'мкф', 'display_symbol' => 'мкФ', 'physical_quantity' => 'Емкость', 'category' => 'capacitance'],
            ['name' => 'Нанофарад', 'symbol' => 'нф', 'display_symbol' => 'нФ', 'physical_quantity' => 'Емкость', 'category' => 'capacitance'],

            // Добавленные единицы длины
            ['name' => 'Метр', 'symbol' => 'м', 'display_symbol' => 'м', 'physical_quantity' => 'Длина', 'category' => 'length'],
            ['name' => 'Сантиметр', 'symbol' => 'см', 'display_symbol' => 'см', 'physical_quantity' => 'Длина', 'category' => 'length'],
            ['name' => 'Миллиметр', 'symbol' => 'мм', 'display_symbol' => 'мм', 'physical_quantity' => 'Длина', 'category' => 'length'],
            ['name' => 'Километр', 'symbol' => 'км', 'display_symbol' => 'км', 'physical_quantity' => 'Длина', 'category' => 'length'],
            ['name' => 'Дециметр', 'symbol' => 'дм', 'display_symbol' => 'дм', 'physical_quantity' => 'Длина', 'category' => 'length'],
            ['name' => 'Микрометр', 'symbol' => 'мкм', 'display_symbol' => 'мкм', 'physical_quantity' => 'Длина', 'category' => 'length'],
        ];

        foreach ($units as $unit) {
            $normalizedSymbol = mb_strtolower($unit['symbol']);

            if (!MeasurementUnit::where('symbol', $normalizedSymbol)->exists()) {
                MeasurementUnit::create([
                    'name' => $unit['name'],
                    'symbol' => $unit['symbol'],
                    'display_symbol' => $unit['display_symbol'],
                    'physical_quantity' => $unit['physical_quantity'],
                    'measurement_category_id' => $createdCategories[$unit['category']]->id
                ]);
            }
        }
    }
}
