<?php

namespace Database\Seeders;

use App\Models\DeviceType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $types = [
            ['name' => 'Автоматический выключатель', 'code' => 'CB'],
            ['name' => 'УЗО', 'code' => 'RCD'],
            ['name' => 'Дифференциальный автомат', 'code' => 'RCBO']
        ];

        foreach ($types as $type) {
            DeviceType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
