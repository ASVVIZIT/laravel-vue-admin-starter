<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company; // Импортируем модель Company

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        // Используем фабрику для создания 50 компаний
        Company::factory()->count(50)->create();
    }
}
