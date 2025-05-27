<?php

namespace Database\Seeders\ElectricalProtection\oldVersions;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\CircuitBreaker;
use Illuminate\Database\Seeder;

class SchneiderElectricActi9iC60Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // model	        poles	nominal_current	trip_curve
        // iC60N 1P C06	    1	    6	            C
        // iC60H 4P D32	    4	    32	            D
        // iC60L 2P B16	    2	    16	            B

        // Создаём бренд Schneider Electric
        $schneider = Brand::updateOrCreate(
            ['name' => 'Schneider Electric'],
            [
                'country' => 'Франция',
                'website' => 'https://www.se.com',
                'description' => 'Мировой лидер в области автоматизации и управления энергией'
            ]
        );

        // Полный модельный ряд Acti9 iC60 (2025)
        // Возможные комбинации согласно схемотехники серии
        $models = [
            ['iC60N 1P C06', 1, 6, 'C', 'C'],
            ['iC60N 1P C10', 1, 10, 'C', 'C'],
            ['iC60N 1P C16', 1, 16, 'C', 'C'],
            ['iC60N 2P C20', 2, 20, 'C', 'C'],
            ['iC60N 2P C25', 2, 25, 'C', 'C'],
            ['iC60N 3P C25', 3, 25, 'C', 'AC'],
            ['iC60N 4P C32', 4, 32, 'C', 'AC'],
            ['iC60H 1P D16', 1, 16, 'D', 'AC'],
            ['iC60H 2P D20', 2, 20, 'D', 'AC'],
            ['iC60H 3P D25', 3, 25, 'D', 'AC'],
            ['iC60H 4P D32', 4, 32, 'D', 'AC'],
            ['iC60L 1P B10', 1, 10, 'B', 'B'],
            ['iC60L 2P B16', 2, 16, 'B', 'B'],
            ['iC60L 3P B20', 3, 20, 'B', 'B'],
            ['iC60L 4P B25', 4, 25, 'B', 'B'],
            ['iC60H 3P D20', 3, 20, 'D', 'AC']
        ];

        foreach ($models as $model) {
            CircuitBreaker::updateOrCreate(
                [
                    'model' => $model[0] // Уникальный идентификатор
                ],
                [
                    'brand_id' => $schneider->id,
                    'type_id' => 1, // ID типа "Автоматический выключатель"
                    'series' => 'Acti9 iC60'. match($model[0][4]) { // Буква типа (N, H, L) в названии модели
                        'N' => 'N',
                        'H' => 'H',
                        'L' => 'L',
                    },
                    'type' => $model[4], // Тип срабатывания (C, B, AC)
                    'poles' => $model[1],
                    'modular_size' => $model[1].'D',
                    'nominal_current' => $model[2],
                    'nominal_current_unit_id' => 1, // ID единицы "Ампер"
                    'trip_curve' => $model[3],
                    'breaking_capacity' => match($model[0][4]) { // Буква типа (N, H, L) в названии модели
                        'N' => 6,
                        'H' => 10,
                        'L' => 4.5,
                    },
                    'breaking_capacity_unit_id' => 2, // ID единицы "килоампер"
                    'tripping_time' => 20, // Время срабатывания (мс)
                    'tripping_time_unit_id' => 3, // мс
                    'rated_diff_current' => 30, // Уставка дифференциального тока
                    'rated_diff_current_unit_id' => 3, // ID для "mA"
                    'voltage' => 400,
                    'voltage_unit_id' => 4,
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ',
                    'temperature_range_min' => -25,
                    'temperature_range_min_unit_id' => 10,
                    'temperature_range_max' => 55,
                    'temperature_range_max_unit_id' => 10,
                    'pollution_degree' => 'Степень 2',
                    'housing_material' => 'Термопласт',
                    'standards' => 'IEC 60898',
                    'rcd_type' => null, // Для УЗО (не требуется)
                    'combined_protection' => null, // Комбинированная защита
                ]
            );
        }
    }


    /*
     * Возможные комбинации для Acti9 iC60 могут включать:
        1. **Типы (N, H, L):**
        - N: Стандартные характеристики
        - H: Высокая отключающая способность
        - L: Низкие характеристики

        2. **Количество полюсов (1P, 2P, 3P, 4P):**
        - Допустимые значения: 1, 2, 3, 4.

        3. **Кривые отключения (B, C, D):**
        - B: Для защиты цепей с низкими пусковыми токами (освещение)
        - C: Для общих цепей (розетки)
        - D: Для цепей с высокими пусковыми токами (двигатели)

        4. **Номинальные токи:**
        - Для типа N: 6A, 10A, 16A, 20A
        - Для типа H: 25A, 32A
        - Для типа L: 10A, 16A, 20A

        Исходя из этого, можно предположить, что номинальные токи могут варьироваться в зависимости от типа и кривой. Например:
        - Тип N с кривой C: 6A, 10A, 16A, 20A, 25A
        - Тип H с кривой D: 16A, 25A, 32A
        - Тип L с кривой B: 10A, 16A, 20A

        Пользователь запросил добавление моделей:
        - iC60N 3P C25 (3P, 25A, C)
        - iC60H 1P D16 (1P, 16A, D)
        - iC60L 3P B20 (3P, 20A, B)

        Также, возможно, существуют другие комбинации. Например:
        - iC60N 4P C32 (4P, 32A, C)
        - iC60H 2P D20 (2P, 20A, D)
        - iC60L 4P B25 (4P, 25A, B)
     * */
}
