<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\ReflexIC60;
use Illuminate\Database\Seeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\ReflexIC60\ReflexIC60BSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\ReflexIC60\ReflexIC60CSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\ReflexIC60\ReflexIC60DSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\ReflexIC60\ReflexIC60RCBOSEeder;

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
