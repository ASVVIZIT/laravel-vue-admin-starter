<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;

class ContactChannelSeeder extends Seeder
{
    /**
     * Запустить сидеры каналов связи.
     */
    public function run(): void
    {
        $this->command->info('🔵 [ContactChannelSeeder] Starting channel seeding...');
        $this->command->newLine();

        $this->call([
            SeedContactChannelsSocialNetworks::class,
            SeedContactChannelsMessengers::class,
            SeedContactChannelsMaps::class,
            SeedContactChannelsOther::class,
            SeedContactChannelsMixed::class,
        ]);

        $this->command->newLine();
        $this->command->info('🟢 [ContactChannelSeeder] Channel seeding complete!');
    }
}
