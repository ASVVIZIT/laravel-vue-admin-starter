<?php

namespace App\Providers;

use App\Policies\UserTabPolicy;
use App\Models\UserTab;
use Illuminate\Database\Events\QueryExecuted;
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
        if (config('app.env') !== 'production') {
            DB::listen(function (QueryExecuted $query) {
                Log::info('SQL Query: ' . $query->sql . ' | Bindings: ' . implode(', ', $query->bindings));
            });
        }
    }
}
