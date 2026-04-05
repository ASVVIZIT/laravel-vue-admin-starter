<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class SmartLightResetCommand extends Command
{
    protected $signature = 'smartlight:reset 
                            {--dry-run : Показать план без выполнения}
                            {--force : Выполнить без подтверждения}
                            {--skip-seed : Пропустить сидеры}
                            {--only-migrate : Только миграция}';

    protected $description = 'Безопасный сброс модуля SmartLight (префикс smart_light_)';

    // ✅ ОБНОВЛЕНО: все таблицы с префиксом
    protected array $smartLightTables = [
        'smart_light_telemetry',
        'smart_light_devices',
        'smart_light_settings',
        'smart_light_power_supplies',  // ✅ Было: power_supplies
        'smart_light_bulb_types',       // ✅ Было: bulb_types
        'smart_light_battery_types',    // ✅ Было: battery_types
    ];

    protected string $migrationPath = 'database/migrations/2026_04_03_000001_create_smart_light_tables.php';
    protected string $seederClass = 'Database\\Seeders\\SmartLight\\SmartLightSeeder';

    public function handle(): int
    {
        $this->info('🔧 SmartLight Reset (smart_light_ prefix)');

        if (! $this->checkEnvironment()) return Command::FAILURE;

        $this->showPlan();

        if ($this->option('dry-run')) {
            $this->info('🔍 Dry-run завершён');
            return Command::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm('⚠️  Продолжить?', false)) {
            return Command::FAILURE;
        }

        try {
            if ($this->option('only-migrate')) {
                return $this->runMigrationOnly() ? Command::SUCCESS : Command::FAILURE;
            }

            if (! $this->dropSmartLightTables()) return Command::FAILURE;
            if (! $this->runMigration()) return Command::FAILURE;
            if (! $this->option('skip-seed') && ! $this->runSeeder()) return Command::FAILURE;

            $this->runVerification();

            $this->info('🎉 SmartLight обновлён! Проверьте: /smart-light/dashboard');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    protected function dropSmartLightTables(): bool
    {
        $this->info('🗑️  Удаление таблиц SmartLight...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        foreach ($this->smartLightTables as $table) {
            if (Schema::hasTable($table)) {
                Schema::dropIfExists($table);
                $this->line("   ✅ Dropped: $table");
            } else {
                $this->line("   ⚪ Skipped: $table");
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        return true;
    }

    protected function runVerification(): void
    {
        $this->info('🔍 Проверка...');

        // Проверка таблиц
        $this->info('   📊 Таблицы:');
        foreach ($this->smartLightTables as $table) {
            $exists = Schema::hasTable($table) ? '✅' : '❌';
            $count = $exists ? DB::table($table)->count() : 0;
            $this->line("      $exists $table: $count записей");
        }

        // Проверка связей
        $device = \App\Models\SmartLight\SmartLightDevice::with([
            'batteryType', 'bulbType', 'powerSupply'
        ])->first();

        if ($device) {
            $this->info('   🔗 Связи:');
            $this->line('      • Battery: ' . ($device->batteryType?->name ? '✅' : '❌'));
            $this->line('      • Bulb: ' . ($device->bulbType?->name ? '✅' : '❌'));
            $this->line('      • Power: ' . ($device->powerSupply?->name ? '✅' : '❌'));
        }

        // Проверка что другие модули не затронуты
        $this->info('   🛡️  Другие модули:');
        $this->line('      • Companies: ' . \App\Models\Company\Company::count() . ' ✅');
    }
}
