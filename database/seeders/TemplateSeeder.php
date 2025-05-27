<?php

namespace Database\Seeders;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\Cable;
use App\Models\ElectricalProtection\CircuitBreaker;
use App\Models\ElectricalProtection\RCD;
use App\Models\TableRow;
use App\Models\Template;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {

        $template = Template::create(['name' => 'Product Catalog']);

        $columns = [
            ['type' => 'text', 'label' => 'Product Name', 'order' => 1],
            ['type' => 'select', 'label' => 'Category', 'options' => [
                'Electronics',
                'Clothing',
                'еще что то 1',
                'еще что то 2'
            ],
                'order' => 2
            ],
            ['type' => 'select', 'label' => 'Назначение', 'options' => [
                'Назначение 1',
                'Назначение 2',
                'Назначение 3',
                'Назначение 4',
                'Назначение 5'
            ],
                'order' => 3
            ],
            ['type' => 'number', 'label' => 'Price', 'order' => 4]
        ];

        foreach ($columns as $col) {
            $template->columns()->create($col);
        }

        $parentRow = TableRow::create([
            'template_id' => $template->id,
            'data' => [
                'Product Name' => 'Main Product',
                'Category' => 'Electronics',
                'Назначение' => 'Назначение 1',
                'Price' => 110
            ]
        ]);

        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow->id,
            'data' => [
                'Product Name' => 'Sub Product',
                'Category' => 'Components',
                'Назначение' => 'Назначение 5',
                'Price' => 550
            ]
        ]);

        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow->id,
            'data' => [
                'Product Name' => 'Sub Product 2',
                'Category' => 'Components',
                'Назначение' => 'Назначение 3',
                'Price' => 110
            ]
        ]);
        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow->id,
            'data' => [
                'Product Name' => 'Sub Product 3',
                'Category' => 'Components',
                'Назначение' => 'Назначение 4',
                'Price' => 150
            ]
        ]);


        $parentRow2 = TableRow::create([
            'template_id' => $template->id,
            'data' => [
                'Product Name' => 'Main Product 2',
                'Category' => 'еще что то 1',
                'Назначение' => 'Назначение 2',
                'Price' => 110
            ]
        ]);

        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow2->id,
            'data' => [
                'Product Name' => 'Sub Product 2',
                'Category' => 'Components',
                'Назначение' => 'Назначение 4',
                'Price' => 550
            ]
        ]);
    }
}
