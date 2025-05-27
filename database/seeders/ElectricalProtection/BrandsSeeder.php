<?php

namespace Database\Seeders\ElectricalProtection;

use App\Models\ElectricalProtection\Brand;
use Illuminate\Database\Seeder;

class BrandsSeeder extends Seeder
{
    public function run()
    {

        // Бренды
        Brand::factory()->createMany([
            [
                'name' => 'ABB',
                'country' => 'Швейцария',
                'website' => 'https://new.abb.com',
                'description' => ''
            ],
            [
                'name' => 'IEK',
                'country' => 'Россия',
                'website' => 'https://iek.ru',
                'description' => ''
            ],

            // Бренды для проводов
            [
                'name' => 'Nexans',
                'country' => 'Франция',
                'website' => 'https://www.nexans.com',
                'description' => ''
            ],
            [
                'name' => 'Prysmian Group',
                'country' => 'Италия',
                'website' => 'https://www.prysmiangroup.com',
                'description' => ''
            ],
            [
                'name' => 'Belden',
                'country' => 'США',
                'website' => 'https://www.belden.com',
                'description' => ''
            ],
            [
                'name' => 'КВТ',
                'country' => 'Россия',
                'website' => 'https://www.kvt.ru',
                'description' => ''
            ],
            [
                'name' => 'ЭКЗ',
                'country' => 'Россия',
                'website' => 'https://www.ekz.ru',
                'description' => ''
            ]
        ]);
    }
}
