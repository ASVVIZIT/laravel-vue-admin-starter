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
            // ✅ VK — username (без @)
            CompanyContactChannel::factory()
                ->count(1)
                ->socialNetwork()
                ->for($company)
                ->create([
                    'type' => 'social_network',
                    'identifier' => fake()->userName(),  // anna.sazonova
                    'metadata' => ['platform' => 'vk'],
                ]);

            // ✅ Instagram — username (с @ или без)
            CompanyContactChannel::factory()
                ->count(1)
                ->socialNetwork()
                ->for($company)
                ->create([
                    'type' => 'social_network',
                    'identifier' => fake()->userName(),  // username123
                    'metadata' => ['platform' => 'instagram'],
                ]);

            // ✅ Twitter/X — username (с @)
            CompanyContactChannel::factory()
                ->count(1)
                ->socialNetwork()
                ->for($company)
                ->create([
                    'type' => 'social_network',
                    'identifier' => '@' . fake()->userName(),  // @username
                    'metadata' => ['platform' => 'twitter'],
                ]);
        });

        $this->command->info('📱 Создано соцсетей: ' . CompanyContactChannel::where('type', 'social_network')->count());
    }
}
