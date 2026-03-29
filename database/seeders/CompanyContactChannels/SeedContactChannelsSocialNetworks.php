<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel;

class SeedContactChannelsSocialNetworks extends Seeder
{
    public function run(): void
    {
        Company::all()->each(function ($company) {
            CompanyContactChannel::factory()
                ->count(3)
                ->socialNetwork()
                ->for($company)
                ->create();
        });

        $this->command->info('📱 Создано соцсетей: ' . CompanyContactChannel::where('type', 'social_network')->count());
    }
}
