<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\MainCircuitBreakers;

use Illuminate\Database\Seeder;

class AllMainBreakersSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(C60HDCSeeder::class);
        $this->call(IC60HSeeder::class);
        $this->call(IC60LSeeder::class);
        $this->call(IC60NSeeder::class);
    }
}
