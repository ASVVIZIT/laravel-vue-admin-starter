<?php

namespace Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\Accessory;
use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Database\Seeder;

class TwidoAccessorySeeder extends Seeder
{
    public function run()
    {
        $brand = Brand::where('name', 'Schneider Electric')->first();

        if (!$brand) {
            $brand = Brand::create([
                'name' => 'Schneider Electric',
                'country' => 'Франция',
                'website' => 'https://www.se.com ',
                'description' => 'Мировой лидер в области автоматизации и управления энергией',
            ]);
        }

        // Получаем ID типа устройства "ACCESSORY"
        $deviceType = DeviceType::where('code', 'ACCESSORY')->first();
        if (!$deviceType) {
            $deviceType = DeviceType::updateOrCreate([
                'code' => 'ACCESSORY',
                'name' => 'Аксессуар',
                'description' => 'Вспомогательные модульные устройства',
            ]);
        }

        // Массив аксессуаров
        $accessories = [
            // Twido PLC
            [
                'model' => 'Twido PLC',
                'series' => 'Twido',
                'name' => 'Программируемый контроллер',
                'description' => 'Интеграция с BMS и ПЛК системами. Поддержка Modbus и CAN.',
                'compatible_models' => 'Reflex iC60, iCT, iSW',
                'communication_protocol' => 'Modbus, CAN',
                'remote_control' => true,
                'ip_rating' => null,
                'mounting_type' => null,
                'standards' => null,
            ],

            // ARA iC60
            [
                'model' => 'ARA iC60',
                'series' => 'Acti9',
                'name' => 'Автоматическое устройство повторного включения',
                'description' => 'Для автоматов iC60N, iC60H. Обеспечивает автоматическое восстановление питания после кратковременных повреждений.',
                'compatible_models' => 'iC60N, iC60H',
                'communication_protocol' => 'Ti24',
                'remote_control' => true,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],

            // Вспомогательный контакт iOF/SD+OF
            [
                'model' => 'iOF/SD+OF',
                'series' => 'Acti9',
                'name' => 'Вспомогательный контакт iOF/SD+OF',
                'description' => 'Выбор между OF+SD или OF+OF. Используется для дистанционной сигнализации и управления.',
                'compatible_models' => 'iC60N, iC60H, iDPN',
                'communication_protocol' => 'Ti24',
                'remote_control' => true,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],

            // Расцепитель iMX
            [
                'model' => 'iMX Расцепитель',
                'series' => 'Acti9',
                'name' => 'Независимый расцепитель iMX',
                'description' => 'Для автоматов IC60L/K/Z. Удаленное отключение при внешнем воздействии.',
                'compatible_models' => 'IC60L, IC60K, IC60Z',
                'communication_protocol' => 'Ti24',
                'remote_control' => true,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],

            // Дополнительные аксессуары для Reflex iC60
            [
                'model' => 'Ti24 Interface Module',
                'series' => 'Acti9',
                'name' => 'Модуль интерфейса Ti24',
                'description' => 'Подключение к ПЛК и BMS системам. Совместимость с Reflex iC60, iCT, iSW.',
                'compatible_models' => 'Reflex iC60, iCT, iSW',
                'communication_protocol' => 'Ti24',
                'remote_control' => true,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],

            [
                'model' => 'iMDU 24V',
                'series' => 'Acti9',
                'name' => 'Устройство дистанционного управления',
                'description' => 'Работает от 24 V постоянного тока. Для автоматов Reflex iC60, iCT, iSW.',
                'compatible_models' => 'Reflex iC60, iCT, iSW',
                'communication_protocol' => 'Ti24',
                'remote_control' => true,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],

            [
                'model' => 'AB1-GA',
                'series' => 'Acti9',
                'name' => 'Защёлкивающаяся этикетка AB1-GA',
                'description' => 'Для маркировки положения автомата. Защита от несанкционированного доступа.',
                'compatible_models' => 'iC60N, iC60H, iDPN',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],

            [
                'model' => 'AB1-GZ',
                'series' => 'Acti9',
                'name' => 'Защёлкивающаяся этикетка AB1-GZ',
                'description' => 'Этикетка для маркировки положения автомата. Стандартная модель.',
                'compatible_models' => 'iDPN N, IC60N, IC60H',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            [
                'model' => 'Plumbed Terminal Caps 3P',
                'series' => 'Acti9 Mounting',
                'name' => 'Пломбируемая заглушка 3P',
                'description' => 'Заглушка для защиты от несанкционированного доступа к контактам.',
                'compatible_models' => 'iDPN N, Reflex iC60, IC60N',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Навесная блокировка
            [
                'model' => 'A9A26970',
                'series' => 'Acti9',
                'name' => 'Навесная блокировка',
                'description' => 'Блокировка в отключенном положении. Защита от случайного включения.',
                'compatible_models' => 'iC60N, iC60H, iDPN N',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Защитная крышка винтов
            [
                'model' => 'A9A26981',
                'series' => 'Acti9',
                'name' => 'Защитная крышка винтов',
                'description' => 'Для защиты винтовых клемм от пыли и влаги.',
                'compatible_models' => 'iC60N, iC60H',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Гребёнчатая шинка
            [
                'model' => 'Гребёнчатая шинка',
                'series' => 'Acti9',
                'name' => 'Гребёнчатая шинка',
                'description' => 'Для быстрого соединения нескольких автоматов. Подходит для модульных автоматов Acti9.',
                'compatible_models' => 'iC60N, iC60H, iDPN N',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Переходник для гребёнчатой шинки
            [
                'model' => 'Переходник для гребёнчатой шинки',
                'series' => 'Acti9',
                'name' => 'Переходник для гребёнчатой шинки',
                'description' => 'Служит для подключения гребёнчатой шинки к автоматам.',
                'compatible_models' => 'iC60N, iC60H',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Винтовая клемма под кольцевой наконечник
            [
                'model' => 'Винтовая клемма под кольцевой наконечник',
                'series' => 'Acti9',
                'name' => 'Винтовая клемма под кольцевой наконечник',
                'description' => 'Для установки кабелей с кольцевыми наконечниками.',
                'compatible_models' => 'iC60N, iC60H',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Клемма Al 50 мм²
            [
                'model' => 'Клемма Al 50 мм²',
                'series' => 'Acti9',
                'name' => 'Клемма Al 50 мм²',
                'description' => 'Для подключения алюминиевых кабелей до 50 мм².',
                'compatible_models' => 'iC60N, iC60H',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Изолированная распределительная клемма
            [
                'model' => 'Изолированная распределительная клемма',
                'series' => 'Acti9',
                'name' => 'Изолированная распределительная клемма',
                'description' => 'Для безопасного подключения и распределения нагрузки.',
                'compatible_models' => 'iC60N, iC60H, iDPN N',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Поворотная рукоятка
            [
                'model' => 'Поворотная рукоятка',
                'series' => 'Acti9',
                'name' => 'Поворотная рукоятка',
                'description' => 'Для удобства монтажа на дверь щита.',
                'compatible_models' => 'iC60N, iC60H, iDPN N',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Комплект для кольцевых наконечников
            [
                'model' => 'Комплект для кольцевых наконечников',
                'series' => 'Acti9',
                'name' => 'Комплект для кольцевых наконечников',
                'description' => 'Для упрощения подключения кабелей с кольцевыми наконечниками.',
                'compatible_models' => 'iC60N, iC60H, iDPN N',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
            // Добавлено: Межполюсная перегородка
            [
                'model' => 'Межполюсная перегородка',
                'series' => 'Acti9',
                'name' => 'Межполюсная перегородка',
                'description' => 'Для разделения полюсов и обеспечения безопасности.',
                'compatible_models' => 'iC60N, iC60H, iDPN N',
                'communication_protocol' => null,
                'remote_control' => false,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],

            [
                'model' => 'iOF Signal',
                'series' => 'Acti9',
                'name' => 'Сигнал положения iOF',
                'description' => 'Вспомогательный сигнал положения автомата. Интеграция с системами управления.',
                'compatible_models' => 'iDPN N, Reflex iC60',
                'communication_protocol' => 'Ti24',
                'remote_control' => true,
                'ip_rating' => 'IP20',
                'mounting_type' => 'Модульный (9 мм)',
                'standards' => 'IEC 60947-5-1',
            ],
        ];

        foreach ($accessories as $item) {
            Accessory::updateOrCreate(
                ['model' => $item['model']],
                [
                    'brand_id' => $brand->id,
                    'type_id' => $deviceType->id,
                    'series' => $item['series'],
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'compatible_models' => $item['compatible_models'],
                    'communication_protocol' => $item['communication_protocol'],
                    'remote_control' => $item['remote_control'] ?? false,
                    'ip_rating' => $item['ip_rating'] ?? null,
                    'mounting_type' => $item['mounting_type'] ?? null,
                    'standards' => $item['standards'] ?? null,
                ]
            );
        }
    }
}
