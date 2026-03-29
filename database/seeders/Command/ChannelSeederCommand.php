<?php

namespace Database\Seeders\Command;

use Illuminate\Console\Command;

/**
 * ============================================================================
 * CHANNEL SEEDER COMMAND — КОМАНДА ДЛЯ ЗАПУСКА СИДИНГА КАНАЛОВ
 * ============================================================================
 * 📁 Путь: database/seeders/Command/ChannelSeederCommand.php
 * ✅ Используется: Ручной запуск через artisan
 * ✅ Безопасно менять — влияет только на запуск сидинга
 * ============================================================================
 */
class ChannelSeederCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:channels';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed contact channels for companies';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Starting channel seeder...');
        $this->newLine();

        // ✅ ВЫЗЫВАЕМ СИДЕР КАНАЛОВ
        $this->call(\Database\Seeders\CompanyContactChannels\CompanyContactChannelsSeeder::class);

        $this->newLine();
        $this->info('✅ Channel seeder completed!');

        return 0;
    }
}
