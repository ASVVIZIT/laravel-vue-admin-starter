<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;

/**
 * ============================================================================
 * COMPANY CONTACT CHANNELS SEEDER — ГЛАВНЫЙ СИДИНГ КАНАЛОВ
 * ============================================================================
 * 📁 Путь: database/seeders/CompanyContactChannels/CompanyContactChannelsSeeder.php
 * ✅ Используется: Основной сидер для migrate:fresh --seed
 * ✅ Безопасно менять — влияет на создание каналов
 * ============================================================================
 */
class CompanyContactChannelsSeeder extends Seeder
{
    /**
     * Режимы сидинга
     */
    protected const MODE_DEFAULT = 'default';  // Factory (7 каналов)
    protected const MODE_FAST = 'fast';        // Batch insert (быстро)

    /**
     * Текущий режим (можно менять здесь)
     */
    protected const CURRENT_MODE = self::MODE_DEFAULT;

    /**
     * Запустить сидер.
     */
    public function run(): void
    {
        $this->command->info('📞 Starting channel seeding...');
        $this->command->newLine();

        // ✅ ВЫБИРАЕМ РЕЖИМ В ЗАВИСИМОСТИ ОТ КОНСТАНТЫ
        match (self::CURRENT_MODE) {
            self::MODE_FAST => $this->runFastMode(),
            default => $this->runDefaultMode(),
        };

        $this->command->newLine();
        $this->command->info('✅ Channel seeding completed!');
    }

    /**
     * Запустить в режиме по умолчанию (Factory).
     */
    protected function runDefaultMode(): void
    {
        $this->call([
            ContactChannelSeeder::class,
        ]);
    }

    /**
     * Запустить в быстром режиме (Batch Insert).
     */
    protected function runFastMode(): void
    {
        $this->call([
            FastCompanyContactChannelSeeder::class,
        ]);
    }
}
