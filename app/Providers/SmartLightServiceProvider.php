<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\SmartLight\DeviceSettingsService;
use App\Services\SmartLight\DeviceService;
use App\Services\SmartLight\TelemetryService;
use App\Services\SmartLight\PowerManager;

class SmartLightServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(DeviceSettingsService::class, function ($app) {
            return new DeviceSettingsService();
        });

        $this->app->singleton(DeviceService::class, function ($app) {
            return new DeviceService();
        });

        $this->app->singleton(TelemetryService::class, function ($app) {
            return new TelemetryService();
        });

        $this->app->singleton(PowerManager::class, function ($app) {
            return new PowerManager();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
