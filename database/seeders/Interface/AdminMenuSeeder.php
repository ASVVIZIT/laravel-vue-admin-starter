<?php

namespace Database\Seeders\Interface;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Acl;

class AdminMenuSeeder extends Seeder
{
    public function run(): void
    {
        // Основные разделы меню
        $dashboard = Menu::firstOrCreate([
            'name' => 'Dashboard',
            'route' => 'dashboard',
            'icon' => 'house-fill',
            'order' => 1,
            'permission' => null
        ]);

        $admin = Menu::firstOrCreate([
            'name' => 'Администрирование',
            'route' => null,
            'icon' => 'gear-fill',
            'order' => 90,
            'permission' => Acl::PERMISSION_VIEW_MENU_ADMINISTRATOR
        ]);

        // Вложенные пункты
        Menu::firstOrCreate([
            'name' => 'Пользователи',
            'route' => 'admin.users.index',
            'icon' => 'people-fill',
            'parent_id' => $admin->id,
            'order' => 1,
            'permission' => Acl::PERMISSION_USER_MANAGE
        ]);

        Menu::firstOrCreate([
            'name' => 'Роли и права',
            'route' => 'admin.roles.index',
            'icon' => 'key-fill',
            'parent_id' => $admin->id,
            'order' => 2,
            'permission' => Acl::PERMISSION_PERMISSION_MANAGE
        ]);

        // Электрическая защита
        $electrical = Menu::firstOrCreate([
            'name' => 'Электрическая защита',
            'route' => null,
            'icon' => 'lightning-charge-fill',
            'order' => 20,
            'permission' => Acl::PERMISSION_VIEW_MENU_ENTITY
        ]);

        Menu::firstOrCreate([
            'name' => 'Бренды',
            'route' => 'electrical.brands.index',
            'icon' => 'building-fill',
            'parent_id' => $electrical->id,
            'order' => 1,
            'permission' => Acl::PERMISSION_ENTITY_MANAGE
        ]);

        // SmartLight (когда будет готов)
        if (config('app.feature_smart_light', true)) {
            $smartLight = Menu::firstOrCreate([
                'name' => 'SmartLight',
                'route' => 'smart-light.dashboard',
                'icon' => 'lightbulb-fill',
                'order' => 30,
                'permission' => Acl::PERMISSION_VIEW_SMART_LIGHT
            ]);
        }
    }
}
