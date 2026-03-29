<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

/**
 * ============================================================================
 * KERNEL — РЕГИСТРАЦИЯ ARTISAN КОМАНД
 * ============================================================================
 * 📁 Путь: app/Console/Kernel.php
 * ✅ Используется: Автоматическая регистрация команд
 * ✅ Безопасно менять — влияет на доступные artisan команды
 * ============================================================================
 */
class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        // ✅ КОМАНДА ДЛЯ СИДИНГА КАНАЛОВ (опционально)
        \Database\Seeders\Command\ChannelSeederCommand::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
