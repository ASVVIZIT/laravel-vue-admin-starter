<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            [
                'name' => 'Тестовая Компания 1',
                'description' => 'Описание первой тестовой компании.',
                'address' => 'г. Москва, ул. Примерная, д. 1',
            ],
            [
                'name' => 'Тестовая Компания 2',
                'description' => 'Описание второй тестовой компании.',
                'address' => 'г. Санкт-Петербург, ул. Тестовая, д. 2',
            ],
            // ... добавьте больше данных по необходимости
        ];

        foreach ($companies as $companyData) {
            Company::create($companyData);
        }
    }
}
