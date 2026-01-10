<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\Acl;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Очищаем кеш
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Получаем guard из конфигурации
        // $guard = config('auth.defaults.guard', 'web');
        $guard = 'web';

        // Удаляем старые роли и разрешения
        Role::where('guard_name', $guard)->delete();
        Permission::where('guard_name', $guard)->delete();

        // Создаем роли
        foreach (Acl::roles() as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => $guard]);
        }

        // Создаем разрешения
        foreach (Acl::permissions() as $permissionName) { // Убедитесь, что разрешение есть здесь
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => $guard]);
        }

        // Очищаем кеш снова
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Назначаем разрешения
        $this->assignPermissions($guard);
    }

    private function assignPermissions(string $guard): void
    {
        // Суперадмин
        $superAdmin = Role::where('name', Acl::ROLE_SUPER_ADMIN)
            ->where('guard_name', $guard)
            ->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions(Permission::where('guard_name', $guard)->get());
        }

        // Админ
        $admin = Role::where('name', Acl::ROLE_ADMIN)
            ->where('guard_name', $guard)
            ->first();
        if ($admin) {
            $admin->syncPermissions([
                Acl::PERMISSION_VIEW_MENU_ADMINISTRATOR,
                Acl::PERMISSION_VIEW_MENU_PERMISSION,
                Acl::PERMISSION_USER_MANAGE,
                Acl::PERMISSION_PERMISSION_MANAGE,
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT
            ]);
        }

        // Менеджер
        $manager = Role::where('name', Acl::ROLE_MANAGER)
            ->where('guard_name', $guard)
            ->first();
        if ($manager) {
            $manager->syncPermissions([
                Acl::PERMISSION_USER_MANAGE,
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT
            ]);
        }
    }
}
