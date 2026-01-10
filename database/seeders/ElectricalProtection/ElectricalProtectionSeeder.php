<?php

namespace Database\Seeders\ElectricalProtection;

use Database\Seeders\ElectricalProtection\Products\Schneider\Acti9\MainCircuitBreakers\C60HDCSeeder;
use Illuminate\Database\Seeder;

class ElectricalProtectionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Единицы измерения
        $this->call(MeasurementUnitSeeder::class);

        // 2. Бренды
        $this->call(Brands\BrandsSeeder::class);
        $this->call(Brands\Schneider\BrandSchneiderSeeder::class);

        // 3. Типы устройств
        $this->call(DeviceTypes\DeviceTypeSeeder::class);

        // 4. Типы кабеля
        $this->call(CableSeeder::class);

        // 5. Продукты (в правильном порядке)
        $this->call(Products\Schneider\Acti9\Accessories\AllAccessoriesSeeder::class);
        $this->call(Products\Schneider\Acti9\MainCircuitBreakers\AllMainBreakersSeeder::class);
        $this->call(Products\Schneider\Acti9\IndustrialSeries\AllIndustrialSeriesSeeder::class);
        $this->call(Products\Schneider\Acti9\SpecialSeries\AllSpecialSeriesSeeder::class);
    }
}
