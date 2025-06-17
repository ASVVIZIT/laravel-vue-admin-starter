<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestPresenceUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'presence:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */

    public function handle()
    {
        // Получаем всех пользователей в presence-канале
        $users = \App\Models\User::where('status', 'online')->get();

        foreach ($users as $user) {
            $this->info("ID {$user->id}: {$user->name} — онлайн");
        }
    }
}
