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
        $this->command->info('');
        $this->command->info('🔐 <bg=yellow;fg=black> РОЛИ И ПРАВА ДОСТУПА </>');

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('auth.defaults.guard', 'web');

        // Канонический сброс: перезаписываем bootstrap-набор из миграции SetupRolePermissions
        Role::where('guard_name', $guard)->delete();
        Permission::where('guard_name', $guard)->delete();

        foreach (Acl::roles() as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => $guard]);
        }

        // Создаём ВСЕ права: меню + остальные (как в миграции)
        $allSystemPermissions = array_values(array_unique(array_merge(
            Acl::menuPermissions(),
            Acl::permissions()
        )));

        foreach ($allSystemPermissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => $guard]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->assignPermissions($guard, $allSystemPermissions);

        $this->command->info('   ✅ <fg=green>Роли и права успешно настроены!</>');
    }

    private function assignPermissions(string $guard, array $allSystemPermissions): void
    {
        // Права, доступные ТОЛЬКО супер-админу
        $superAdminOnly = [
            Acl::PERMISSION_MANAGE_SUPERADMIN,
            Acl::PERMISSION_VIEW_SYSTEM_LOGS,
            Acl::PERMISSION_MANAGE_SYSTEM_SETTINGS,
        ];

        // Админ получает ВСЕ права системы, кроме супер-админских
        $adminPermissions = array_values(array_diff($allSystemPermissions, $superAdminOnly));

        // Супер-админ получает ВСЕ права системы
        $superAdminPermissions = $allSystemPermissions;

        $roles = [
            Acl::ROLE_SUPER_ADMIN => $superAdminPermissions,
            Acl::ROLE_ADMIN => $adminPermissions,
            Acl::ROLE_MANAGER => [
                Acl::PERMISSION_VIEW_MENU_LANDING,
                Acl::PERMISSION_VIEW_MENU_TRAINING,
                Acl::PERMISSION_VIEW_MENU_SMART_LIGHT,
                Acl::PERMISSION_USER_MANAGE,
                Acl::PERMISSION_USER_EDIT_MANAGE,
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_OWN_SOCIAL_MEDIA_LINKS,
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,
                Acl::PERMISSION_VIEW_LANDING,
            ],
            Acl::ROLE_EDITOR => [
                Acl::PERMISSION_VIEW_MENU_LANDING,
                Acl::PERMISSION_VIEW_MENU_CHARTS,
                Acl::PERMISSION_VIEW_MENU_ENTITY,
                Acl::PERMISSION_VIEW_MENU_TRAINING,
                Acl::PERMISSION_ARTICLE_MANAGE,
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,
                Acl::PERMISSION_CREATE_TRAINING_LOG,
                Acl::PERMISSION_VIEW_LANDING,
            ],
            Acl::ROLE_USER => [
                Acl::PERMISSION_VIEW_MENU_LANDING,
                Acl::PERMISSION_VIEW_MENU_TRAINING,
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,
                Acl::PERMISSION_VIEW_TRAINING_STATS,
                Acl::PERMISSION_VIEW_LANDING,
            ],
            Acl::ROLE_VISITOR => [],
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::where('name', $roleName)->where('guard_name', $guard)->first();
            if (!$role) continue;

            $role->syncPermissions($permissions);
            $this->command->line("   👑 {$roleName}: <fg=cyan>" . count($permissions) . " прав</>");
        }
    }
}
