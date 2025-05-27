<?php

namespace Database\Seeders\ElectricalProtection;

use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Database\Seeder;

class DeviceTypeSeeder extends Seeder
{
    public function run()
    {
        $types = [
            // Автоматы и защитные устройства
            ['name' => 'Автоматический выключатель', 'code' => 'CB', 'description' => 'Защита от перегрузки и короткого замыкания'],
            ['name' => 'УЗО', 'code' => 'RCD', 'description' => 'Дифференциальная защита от тока утечки'],
            ['name' => 'Дифференциальный автомат', 'code' => 'RCBO', 'description' => 'Комбинированная защита (автомат + УЗО)'],
            ['name' => 'Дифференциальный модуль', 'code' => 'RCM', 'description' => 'Добавочный модуль к автомату для защиты от тока утечки'],
            ['name' => 'Автомат с дистанционным управлением', 'code' => 'RCBO_REMOTE', 'description' => 'Автомат с Ti24 и дистанционным управлением'],

            // Провода и кабели
            ['name' => 'Кабель', 'code' => 'CABLE', 'description' => 'Электрический кабель (например, ВВГнг-LS)'],
            ['name' => 'Провод', 'code' => 'WIRE', 'description' => 'Электрический провод'],

            // Щитки и монтажные элементы
            ['name' => 'Распределительный щит', 'code' => 'CABINET', 'description' => 'Щит для установки защитных устройств'],
            ['name' => 'Модульный бокс', 'code' => 'MODBOX', 'description' => 'Модульный корпус для автоматов и аксессуаров'],

            // Дополнительные типы
            ['name' => 'Предохранитель', 'code' => 'FUSE', 'description' => 'Защитное устройство от перегрузки'],
            ['name' => 'Разъединитель', 'code' => 'DISCONNECTOR', 'description' => 'Устройство для разрыва цепи'],
            ['name' => 'Аксессуар', 'code' => 'ACCESSORY', 'description' => 'Вспомогательные устройства для модульных систем'],
        ];

        foreach ($types as $type) {
            DeviceType::updateOrCreate(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'code' => $type['code'],
                    'description' => $type['description'] ?? null,
                ]
            );
        }
    }
}
