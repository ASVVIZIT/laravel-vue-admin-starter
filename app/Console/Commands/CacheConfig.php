<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CacheConfig extends Command
{
    protected $signature = 'config:custom-cache {env?}';
    protected $description = 'Cache config using a custom .env file';

    public function handle()
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Установка кодировки UTF-8 в Windows CMD/PowerShell
            exec('chcp 65001');
        }

        $envFile = $this->argument('env') ?: 'production';
        $source = ".env.{$envFile}";
        $target = '.env';

        if (!file_exists($source)) {
            $this->error("File {$source} not found!");
            return;
        }

        // Копируем нужный .env-файл
        copy($source, $target);

        // Кэшируем конфигурацию
        $this->call('config:cache');

        $this->info("Configuration cached using {$source}!");
    }
}
