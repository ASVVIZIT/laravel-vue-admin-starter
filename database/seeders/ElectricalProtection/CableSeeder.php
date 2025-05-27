<?php

namespace Database\Seeders\ElectricalProtection;

use App\Models\ElectricalProtection\Cable;
use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Database\Seeder;

class CableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Получаем ID типа "Кабель" из таблицы ep_device_types
        $cableTypeId = DeviceType::where('code', 'CABLE')->first()->id;
        $brandTypeId = DeviceType::where('code', 'CB')->first()->id;

        // Создаем кабель ВВГнг-LS (IEK)
        Cable::factory()->create([
            'brand_id' => $brandTypeId,
            'type_id' => $cableTypeId,
            'model' => 'Наименование',
            'insulation' => 'ПВХ',
            'cores' => 3,
            'cross_section' => 2.5,
            'current_rating' => 25,
            'temperature_range_min' => -50,
            'temperature_range_min_unit_id' => 10,
            'temperature_range_max' => 70,
            'temperature_range_max_unit_id' => 10,
        ]);
    }
}
