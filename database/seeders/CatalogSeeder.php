<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Cable;
use App\Models\CircuitBreaker;
use App\Models\RCD;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
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
                'website' => 'https://www.se.com'
            ]
        );

        // Полный модельный ряд Acti9 iC60 (2025)
        $models = [
            ['iC60N 1P C06', 1, 6, 'C'],
            ['iC60N 1P C10', 1, 10, 'C'],
            ['iC60N 1P C16', 1, 16, 'C'],
            ['iC60N 2P C20', 2, 20, 'C'],
            ['iC60H 3P D25', 3, 25, 'D'],
            ['iC60H 4P D32', 4, 32, 'D'],
            ['iC60L 1P B10', 1, 10, 'B'],
            ['iC60L 2P B16', 2, 16, 'B']
        ];

        foreach ($models as $model) {
            CircuitBreaker::updateOrCreate(
                [
                    'model' => $model[0] // Уникальный идентификатор
                ],
                [
                    'brand_id' => $schneider->id,
                    'nominal_current' => $model[2],
                    'trip_curve' => $model[3],
                    'poles' => $model[1],
                    'breaking_capacity' => '10 кА',
                    'voltage' => '400V AC',
                    'modular_size' => $model[1].'D',
                    'energy_class' => 'A-III',
                    'ip_rating' => 'IP40',
                    'terminal_type' => 'Винтовой с защёлкой',
                    'protection' => 'Токовая перегрузка, КЗ'
                ]
            );
        }

        // Бренды
        Brand::factory()->createMany([
            [
                'name' => 'ABB',
                'country' => 'Швейцария',
                'website' => 'https://new.abb.com'
            ],
            [
                'name' => 'IEK',
                'country' => 'Россия',
                'website' => 'https://iek.ru'
            ]
        ]);

        // Автоматы ABB (реальные данные из каталога 2025)
        CircuitBreaker::factory()->createMany([
            [
                'model' => 'S201 C16',
                'nominal_current' => 16,
                'trip_curve' => 'C',
                'poles' => 1,
                'breaking_capacity' => 6000
            ],
            [
                'model' => 'S203 D32',
                'nominal_current' => 32,
                'trip_curve' => 'D',
                'poles' => 3,
                'breaking_capacity' => 10000
            ]
        ]);
        // Schneider Acti9 RCD
        RCD::factory()->create([
            'model' => 'A9D91630',
            'rated_diff_current' => '30mA',
            'type' => 'AC'
        ]);
        // Провода ВВГнг-LS (IEK)
        Cable::factory()->create([
            'type' => 'ВВГнг-LS',
            'insulation' => 'ПВХ',
            'cores' => 3,
            'cross_section' => 2.5,
            'current_rating' => 25
        ]);
    }
}
