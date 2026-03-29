<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel;

class SeedContactChannelsMaps extends Seeder
{
    public function run(): void
    {
        Company::all()->each(function ($company) {
            CompanyContactChannel::factory()
                ->count(2)
                ->gisMap()
                ->for($company)
                ->create();

            CompanyContactChannel::factory()
                ->count(1)
                ->yandexMap()
                ->for($company)
                ->create();
        });

        $this->command->info('🗺️ Создано карт: ' . CompanyContactChannel::whereIn('type', ['gis_map', 'yandex_map'])->count());
    }
}
