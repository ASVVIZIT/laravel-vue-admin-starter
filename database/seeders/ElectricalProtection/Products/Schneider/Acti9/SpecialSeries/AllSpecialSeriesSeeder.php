<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\SpecialSeries;
use Illuminate\Database\Seeder;

class AllSpecialSeriesSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(ReflexIC60\ReflexIC60AllSeeder::class);
        $this->call(ReflexIC60\ReflexIC60BSeeder::class);
        $this->call(ReflexIC60\ReflexIC60CSeeder::class);
        $this->call(ReflexIC60\ReflexIC60DSeeder::class);
        $this->call(ReflexIC60\ReflexIC60RCBOSeeder::class);
        $this->call(ReflexIC60\ReflexIC60Seeder::class);

        $this->call(IDPNSeeder::class);
        $this->call(IDSeeder::class);
        $this->call(IK60NSeeder::class);

    }
}
