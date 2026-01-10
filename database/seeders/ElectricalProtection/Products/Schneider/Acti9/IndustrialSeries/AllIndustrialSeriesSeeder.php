<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\IndustrialSeries;

use Illuminate\Database\Seeder;

class AllIndustrialSeriesSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(NG125\NG125HSeeder::class);
        $this->call(NG125\NG125LMASeeder::class);
        $this->call(NG125\NG125LSeeder::class);
        $this->call(NG125\NG125NSeeder::class);
        $this->call(NG125\NG125Seeder::class);

        $this->call(C120Seeder::class);
        $this->call(STISBISeed::class);
    }
}
