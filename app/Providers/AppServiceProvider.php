<?php

namespace App\Providers;

use App\Policies\UserTabPolicy;
use App\Models\UserTab;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    protected $policies = [
        UserTab::class => UserTabPolicy::class,
    ];

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if (config('app.env') === 'production') {
            DB::listen(function (QueryExecuted $query) {
                Log::info('SQL Query: ' . $query->sql . ' | Bindings: ' . implode(', ', $query->bindings));
            });
        }
        if (config('app.env') !== 'development') {
            DB::listen(function (QueryExecuted $query) {
                Log::info('SQL Query: ' . $query->sql . ' | Bindings: ' . implode(', ', $query->bindings));
            });
        }

        if (config('session.domain') === 'auto') {
            $this->app['config']->set('session.domain', $this->getDynamicSessionDomain());
        }

        Broadcast::channel('test-channel', function () {
            return true;
        });
    }

    protected function getDynamicSessionDomain()
    {
        $host = request()->getHost();

        // Для IP-адресов
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $host;
        }

        // Для локальных доменов без точки
        if ($host === 'localhost' || strpos($host, '.test') !== false) {
            return 'localhost';
        }

        // Для обычных доменов
        $parts = explode('.', $host);

        if (count($parts) > 2) {
            // Для поддоменов: sub.example.com → .example.com
            return '.' . implode('.', array_slice($parts, -2, 2));
        }

        return '.' . $host;
    }
}
