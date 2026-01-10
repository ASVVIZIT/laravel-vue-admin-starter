<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\Accessories;

use Illuminate\Database\Seeder;

class AllAccessoriesSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CableAccessoriesSeeder::class);
        $this->call(IdentificationSeeder::class);
        $this->call(MechanicalAccessoriesSeeder::class);
        $this->call(SpecialAccessoriesSeeder::class);
        $this->call(SpecialSeriesSeeder::class);
        $this->call(TwidoAccessorySeeder::class);
        $this->call(VigiDifferentialSeeder::class);
        $this->call(VigiNG125Seeder::class);
    }
}
