<?php

namespace App\Providers;

use App\Policies\UserTabPolicy;
use App\Policies\SmartLightDevicePolicy;
use App\Models\SmartLight\SmartLightDevice;
use App\Models\UserTab;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        UserTab::class => UserTabPolicy::class,
        SmartLightDevice::class => SmartLightDevicePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        // Динамическая проверка принадлежности устройства
        Gate::define('manage-own-smart-light', function ($user, $device) {
            return $device->user_id === $user->id;
        });
        // Проверка глобальных разрешений
        Gate::before(function ($user, $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });
    }
}
