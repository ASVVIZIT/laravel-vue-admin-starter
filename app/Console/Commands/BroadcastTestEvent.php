<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Event;
use App\Events\UserEvent;

class BroadcastTestEvent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'event:test-broadcast';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Триггерит тестовое событие для WebSocket';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {

        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Установка кодировки UTF-8 в Windows CMD/PowerShell
            exec('chcp 65001');
        }

        // Для теста выбран id пользователя 1 (Вероятнее всего это будет администратор)
        $data = ['id' => 1, 'message' => 'Тестовое сообщение для BroadcastTestEvent Reverb server'];

        // Триггер события
        Event::dispatch(new UserEvent($data));

        // Вывод с поддержкой кириллицы
        $this->info('✅ Событие успешно отправлено: ' . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return 0;
    }
}
