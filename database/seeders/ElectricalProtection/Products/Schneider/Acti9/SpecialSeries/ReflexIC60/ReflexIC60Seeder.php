<?php

namespace Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\SpecialSeries\ReflexIC60;
use Illuminate\Database\Seeder;

class ReflexIC60Seeder extends Seeder
{
    public function run()
    {
        $this->call(ReflexIC60BSeeder::class);
        $this->call(ReflexIC60CSeeder::class);
        $this->call(ReflexIC60DSeeder::class);
        $this->call(ReflexIC60RCBOSEeder::class);
    }
}
