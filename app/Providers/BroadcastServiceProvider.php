<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ЭТО ГЛАВНОЕ: Laravel сам создаст маршрут /broadcasting/auth
        // и автоматически применит к нему middleware 'web' (для cookie/сессий)
        // и 'auth:sanctum' (для проверки пользователя).
        Broadcast::routes(['middleware' => ['web', 'auth:sanctum']]);

        require base_path('routes/channels.php');
    }
}
