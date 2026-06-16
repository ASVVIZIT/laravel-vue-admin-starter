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
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('auth.defaults.guard', 'web');

        Role::where('guard_name', $guard)->delete();
        Permission::where('guard_name', $guard)->delete();

        foreach (Acl::roles() as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => $guard]);
        }

        foreach (Acl::permissions() as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => $guard]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->assignPermissions($guard);
    }

    private function assignPermissions(string $guard): void
    {
        // 🔥 SUPER ADMIN — все права
        $superAdmin = Role::where('name', Acl::ROLE_SUPER_ADMIN)->where('guard_name', $guard)->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions(Permission::where('guard_name', $guard)->pluck('name'));
        }

        // 🔥 ADMIN — почти все права
        $admin = Role::where('name', Acl::ROLE_ADMIN)->where('guard_name', $guard)->first();
        if ($admin) {
            $admin->syncPermissions([
                // Меню
                Acl::PERMISSION_VIEW_MENU_ADMINISTRATOR,
                Acl::PERMISSION_VIEW_MENU_PERMISSION,
                Acl::PERMISSION_VIEW_MENU_LANDING,  // 🔥 ДОБАВЛЕНО

                // Пользователи
                Acl::PERMISSION_USER_MANAGE,
                Acl::PERMISSION_PERMISSION_MANAGE,

                // SmartLight
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT,

                // Social Media
                Acl::PERMISSION_VIEW_SOCIAL_MEDIA_LINKS,
                Acl::PERMISSION_MANAGE_SOCIAL_MEDIA_LINKS,

                // Training
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_TRAINING,
                Acl::PERMISSION_VIEW_TRAINING_STATS,
                Acl::PERMISSION_SHARE_TRAINING,

                // 🔥 ДОБАВЛЕНО: Landing
                Acl::PERMISSION_VIEW_LANDING,
                Acl::PERMISSION_MANAGE_LANDING,
            ]);
        }

        // 🔥 MANAGER — ограниченные права
        $manager = Role::where('name', Acl::ROLE_MANAGER)->where('guard_name', $guard)->first();
        if ($manager) {
            $manager->syncPermissions([
                Acl::PERMISSION_USER_MANAGE,
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_OWN_SOCIAL_MEDIA_LINKS,
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,

                // 🔥 ДОБАВЛЕНО: Landing (только просмотр)
                Acl::PERMISSION_VIEW_LANDING,
            ]);
        }

        // 🔥 EDITOR — контент
        $editor = Role::where('name', Acl::ROLE_EDITOR)->where('guard_name', $guard)->first();
        if ($editor) {
            $editor->syncPermissions([
                Acl::PERMISSION_ARTICLE_MANAGE,
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,

                // 🔥 ДОБАВЛЕНО: Landing (только просмотр)
                Acl::PERMISSION_VIEW_LANDING,
            ]);
        }

        // 🔥 USER — минимальные права
        $user = Role::where('name', Acl::ROLE_USER)->where('guard_name', $guard)->first();
        if ($user) {
            $user->syncPermissions([
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,
                Acl::PERMISSION_VIEW_TRAINING_STATS,

                // 🔥 ДОБАВЛЕНО: Landing (только просмотр)
                Acl::PERMISSION_VIEW_LANDING,
            ]);
        }

        // 🔥 VISITOR — без прав
        $visitor = Role::where('name', Acl::ROLE_VISITOR)->where('guard_name', $guard)->first();
        if ($visitor) {
            $visitor->syncPermissions([]);
        }
    }
}
