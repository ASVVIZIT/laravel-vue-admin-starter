<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;

class CompanyContactChannelsSeeder extends Seeder
{
    public function run(): void
    {
        // Сначала убедитесь, что компании существуют
        $this->call([
            CompanySeeder::class, // Вызовите сидер, который создаёт компании, если он не вызывается из DatabaseSeeder
        ]);

        // Затем запустите сидеры для каналов связи
        $this->call([
            SeedContactChannelsMaps::class,
            SeedContactChannelsSocialNetworks::class,
            SeedContactChannelsMessengers::class,
            SeedContactChannelsOther::class,
            SeedContactChannelsMixed::class,
        ]);

        // Затем запустите сидеры для каналов связи
        $this->call([
            ContactChannelSeeder::class,
        ]);
    }
}
