<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\ColumnTemplate;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run()
    {
        $template = Template::create([
            'name' => 'Продукты'
        ]);

        $columns = [
            [
                'type' => 'text',
                'label' => 'Название продукта',
                'order' => 1
            ],
            [
                'type' => 'text',
                'label' => 'Модель',
                'order' => 2
            ],
            [
                'type' => 'number',
                'label' => 'мАмпер',
                'order' => 3
            ],
            [
                'type' => 'number',
                'label' => 'Цена',
                'order' => 4
            ],
            [
                'type' => 'select',
                'label' => 'Категория',
                'options' => ['Электро Автоматы', 'Провода', 'Электроника', 'Одежда', 'Продукты'],
                'order' => 5
            ]
        ];

        foreach ($columns as $column) {
            ColumnTemplate::create(array_merge($column, ['template_id' => $template->id]));
        }
    }
}
