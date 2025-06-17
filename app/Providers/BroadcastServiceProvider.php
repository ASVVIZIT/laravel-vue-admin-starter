<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Broadcast::routes([
            'prefix' => 'api/',
            'middleware' => ['auth:sanctum', 'broadcast.auth', 'web']
        ]);
        //Broadcast::routes(); // Без middleware
        require base_path('routes/channels.php');
    }
}
