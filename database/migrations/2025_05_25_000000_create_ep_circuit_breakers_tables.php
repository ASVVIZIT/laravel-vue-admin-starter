<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Бренды
        Schema::create('ep_brands', function (Blueprint $table) {
            $table->id()->comment('Уникальный ID бренда');
            $table->string('name', 100)->unique()
                ->comment('Название бренда');
            $table->string('website', 100)->unique()
                ->comment('Website бренда');
            $table->string('country', 50)->nullable()
                ->comment('Страна производитель');
            $table->string('description', 255)->nullable()
                ->comment('Описание бренда');
            $table->timestamps();
        });

        // 2. Типы устройств
        Schema::create('ep_device_types', function (Blueprint $table) {
            $table->id()->comment('Уникальный ID типа устройства');
            $table->string('name', 50)->unique()
                ->comment('Название (Автомат, УЗО, Дифавтомат)');
            $table->string('code', 20)->unique()
                ->comment('Код типа (например: CB, RCD, RCBO, CABLE, CABINET');
            $table->string('description', 255)->nullable()
                ->comment('Подробное описание');
            $table->timestamps();
        });

        // 3. Категории измерений
        Schema::create('ep_measurement_categories', function (Blueprint $table) {
            $table->id()->comment('Уникальный ID категории');
            $table->string('name', 50)->collation('utf8mb4_bin')
                ->comment('Системное имя категории');
            $table->string('description', 255)
                ->comment('Описание категории');
            $table->timestamps();
        });

        // 4. Единицы измерений
        Schema::create('ep_measurement_units', function (Blueprint $table) {
            $table->id()->comment('Уникальный ID единицы');
            $table->string('name', 50)->unique()
                ->comment('Название (Ампер, Вольт)');
            $table->string('symbol', 10)->unique()
                ->comment('Символ (A, V)');
            $table->string('display_symbol', 10)
                ->comment('Отображаемый символ');
            $table->string('physical_quantity', 50)
                ->comment('Физическая величина');
            $table->foreignId('measurement_category_id')
                ->constrained('ep_measurement_categories')
                ->comment('ID категории измерений');
            $table->timestamps();
        });

        // 5. Аксессуары
        Schema::create('ep_accessories', function (Blueprint $table) {
            $table->id()->comment('Уникальный ID аксессуара');

            $table->string('model', 100)->unique()
                ->comment('Модель аксессуара (например: ARA iC60)');
            $table->string('name', 100)
                ->comment('Название (например: Модуль дистанционного управления)');
            $table->text('description')->nullable()
                ->comment('Подробное описание');

            $table->float('cross_section')->nullable()
                ->comment('Сечение кабеля (например, 70 мм²)');
            $table->foreignId('cross_section_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица сечения (мм²)');

            $table->integer('current_rating')->nullable()
                ->comment('Номинальный ток');
            $table->foreignId('current_rating_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица тока (A)');

            $table->integer('quantity_per_pack')->nullable()
                ->comment('Количество в упаковке (например, 10 шт.)');
            $table->foreignId('quantity_per_pack_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица количества (шт.)');

            $table->float('thickness')->nullable()
                ->comment('Толщина (например, 8 мм)');
            $table->foreignId('thickness_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица толщины (мм)');

            $table->integer('rated_diff_current')->nullable()
                ->comment('Номинальный дифференциальный ток (мА)');
            $table->foreignId('rated_diff_current_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица дифференциального тока (мА)');

            // Связь с брендом
            $table->foreignId('brand_id')
                ->constrained('ep_brands')
                ->onDelete('restrict')
                ->comment('ID бренда');

            // Тип устройства (из ep_device_types)
            $table->foreignId('type_id')
                ->constrained('ep_device_types')
                ->comment('ID типа устройства (например: Accessory)');

            // Характеристики
            $table->string('series')->nullable()
                ->comment('Серия (например: Acti9)');
            $table->string('compatible_models')->nullable()
                ->comment('Совместимые модели автоматов (через запятую)');

            // Технические параметры
            $table->string('voltage')->nullable()
                ->comment('Напряжение (например: 230V)');
            $table->foreignId('voltage_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица напряжения');

            $table->string('communication_protocol')->nullable()
                ->comment('Протокол связи (например: Ti24)');
            $table->boolean('remote_control')->default(false)
                ->comment('Поддержка дистанционного управления');

            // Безопасность и установка
            $table->string('ip_rating', 10)->nullable()
                ->comment('Класс защиты (например: IP40)');
            $table->string('mounting_type', 50)->nullable()
                ->comment('Тип монтажа (например: модульный)');

            // Другие поля
            $table->string('standards')->nullable()
                ->comment('Стандарты (например: IEC 60947-5-1)');
            $table->string('material')->nullable()
                ->comment('Материал (например: термопласт)');

            $table->timestamps();
        });

        // 6. Автоматы
        Schema::create('ep_circuit_breakers', function (Blueprint $table) {
            // 🔹 Основные данные
            $table->id()->comment('Уникальный ID автомата');
            $table->string('model', 100)->unique()
                ->comment('Модель устройства (например: NG125N 1P B10)');
            $table->boolean('is_main')->default(false)
                ->comment('Является ли главным автоматом');

            // 🔹 Типы устройств и бренд
            $table->foreignId('brand_id')
                ->constrained('ep_brands')
                ->onDelete('restrict')
                ->comment('ID бренда (Schneider Electric и др.)');
            $table->foreignId('type_id')
                ->constrained('ep_device_types')
                ->default(1)
                ->comment('Тип устройства (автомат, УЗО, дифавтомат и т.д.)');

            // 🔹 Характеристики срабатывания
            $table->enum('type', ['B', 'C', 'D', 'AC', 'A', 'K', 'Z', 'MA'])
                ->comment('Кривая срабатывания (B, C, D, AC, A, K, Z, MA)');
            $table->string('rcd_type', 4)->nullable()
                ->comment('Тип УЗО (AC, A, B, G, S)');
            $table->string('trip_curve', 4)
                ->comment('Характеристика срабатывания (B, C, D, MA)');
            $table->integer('poles')
                ->comment('Количество полюсов (1P, 2P, 3P, 4P)');
            $table->string('modular_size', 5)
                ->comment('Модульный размер (например: 1D, 2D)');

            // 🔹 Номинальный ток
            $table->integer('nominal_current')
                ->comment('Номинальный ток (A)');
            $table->foreignId('nominal_current_unit_id')
                ->constrained('ep_measurement_units')
                ->comment('Единица измерения номинального тока (A, mA)');

            // 🔹 Отключающая способность
            $table->string('breaking_capacity', 20)->nullable()
                ->comment('Отключающая способность (например: 6 kA)');
            $table->foreignId('breaking_capacity_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица измерения отключающей способности (kA, A)');

            // 🔹 Время срабатывания
            $table->integer('tripping_time')->nullable()
                ->comment('Время срабатывания (мс)');
            $table->foreignId('tripping_time_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица времени срабатывания (мс, с)');

            // 🔹 Дифференциальный ток (для УЗО и дифавтоматов)
            $table->string('rated_diff_current', 20)->nullable()
                ->comment('Номинальный дифференциальный ток (например: 30 mA)');
            $table->foreignId('rated_diff_current_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица дифференциального тока (mA, A)');

            // 🔹 Электрические параметры
            $table->string('voltage', 20)->default('230/400V')
                ->comment('Рабочее напряжение (например: 230/400 V)');
            $table->foreignId('voltage_unit_id')
                ->constrained('ep_measurement_units')
                ->comment('Единица напряжения (V)');

            $table->string('energy_class', 10)->nullable()
                ->comment('Энергетический класс (например: A-III, A-IV)');

            // 🔹 Конструктивные характеристики
            $table->string('ip_rating', 10)->default('IP20')
                ->comment('Степень защиты IP (например: IP40)');
            $table->string('terminal_type', 30)->default('винтовой')
                ->comment('Тип клеммы (винтовой, безвинтовой)');
            $table->string('protection', 100)->default('Токовая перегрузка, КЗ')
                ->comment('Функции защиты (например: защита двигателей)');
            $table->string('series', 50)->nullable()
                ->comment('Серия (Acti9 iC60, Acti9 NG125 и т.д.)');
            $table->string('combined_protection', 100)->nullable()
                ->comment('Комбинированная защита (двигательная, селективная и т.д.)');

            // 🔹 Температурные диапазоны
            $table->integer('temperature_range_min')->default(-25)
                ->comment('Минимальная температура работы (°C)');
            $table->foreignId('temperature_range_min_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица минимальной температуры (°C, Фаренгейт)');
            $table->integer('temperature_range_max')->default(55)
                ->comment('Максимальная температура работы (°C)');
            $table->foreignId('temperature_range_max_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица максимальной температуры (°C, Фаренгейт)');

            // 🔹 Дополнительные технические параметры
            $table->string('pollution_degree', 20)->default('Степень 2')
                ->comment('Степень загрязнения (по IEC)');
            $table->string('housing_material', 30)->default('Термопласт')
                ->comment('Материал корпуса (Термопласт, Металл)');
            $table->string('standards', 100)->default('IEC 60898')
                ->comment('Соответствие стандартам (IEC 60898, IEC 60947-2 и т.д.)');

            // 🔹 Дополнительные параметры (добавлены)
            $table->string('u_imp', 20)->nullable()
                ->comment('Импульсное напряжение (например: 8 kV)');
            $table->string('u_insulation', 20)->nullable()
                ->comment('Напряжение изоляции (например: 500 V)');
            $table->integer('life_cycles')->nullable()
                ->comment('Механическая долговечность (циклы В-О)');
            $table->string('breaking_current', 20)->nullable()
                ->comment('Ток селективности (например: 4 kA)');
            $table->boolean('sectionning_required')->default(false)
                ->comment('Требуется секционирование');

            // 🔹 Время выдержки / задержки (если используется в серии IC60LMA)
            $table->integer('holding_time')->nullable()
                ->comment('Время удержания перед срабатыванием (мс)');
            $table->foreignId('holding_time_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица времени удержания (мс, с)');

            // 🔹 Рекомендации по аксессуарам
            $table->text('recommended_accessories')->nullable()
                ->comment('Рекомендуемые аксессуары (через запятую)');

            // ⏱️ Дата создания и обновления
            $table->timestamps();
        });

        // 7. Провода
        Schema::create('ep_cables', function (Blueprint $table) {
            $table->id();
            $table->string('model', 100)->unique()
                ->comment('Модель устройства (например, S201)');
            $table->foreignId('brand_id')
                ->constrained('ep_brands')
                ->onDelete('restrict')
                ->comment('Ссылка на бренд');
            $table->foreignId('type_id')
                ->constrained('ep_device_types')
                ->default(3)
                ->comment('Тип устройства (ВВГнг-LS и тд)');
            $table->string('insulation')->default('ПВХ');
            $table->float('cross_section');
            $table->integer('cores');
            $table->integer('current_rating');
            $table->integer('temperature_range_min')->default(-50)
                ->comment('Минимальная температура работы (°C)');
            $table->foreignId('temperature_range_min_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица минимальной температуры (°C, Фаренгейт)');
            $table->integer('temperature_range_max')->default(70)
                ->comment('Максимальная температура работы (°C)');
            $table->foreignId('temperature_range_max_unit_id')->nullable()
                ->constrained('ep_measurement_units')
                ->comment('Единица максимальной температуры (°C, Фаренгейт)');
            $table->timestamps();
        });

        // 8. Связь между автоматами и аксессуарами
        Schema::create('ep_circuit_breaker_accessories', function (Blueprint $table) {
            $table->foreignId('circuit_breaker_id')
                ->constrained('ep_circuit_breakers')
                ->onDelete('restrict');
            $table->foreignId('accessory_id')
                ->constrained('ep_accessories')
                ->onDelete('restrict');
            $table->primary(['circuit_breaker_id', 'accessory_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('ep_circuit_breaker_accessories');
        Schema::dropIfExists('ep_cables');
        Schema::dropIfExists('ep_circuit_breakers');
        Schema::dropIfExists('ep_accessories');
        Schema::dropIfExists('ep_measurement_units');
        Schema::dropIfExists('ep_measurement_categories');
        Schema::dropIfExists('ep_device_types');
        Schema::dropIfExists('ep_brands');
    }
};
