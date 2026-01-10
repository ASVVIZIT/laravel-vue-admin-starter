<?php

namespace Database\Seeders\ElectricalProtection\Brands\Schneider;

use App\Models\ElectricalProtection\Brand;
use Illuminate\Database\Seeder;

class BrandSchneiderSeeder extends Seeder
{
    public function run()
{
    Brand::updateOrCreate(
        ['name' => 'Schneider Electric'],
        [
            'country' => 'Франция', // Страна происхождения бренда
            'website' => 'https://www.se.com ', // Официальный сайт
            'description' => 'Мировой лидер в области автоматизации и управления энергией' // Описание бренда
        ]
    );
}
}
