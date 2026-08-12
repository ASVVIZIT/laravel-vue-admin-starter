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
        // Сбрасываем кэш прав перед началом
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('auth.defaults.guard', 'web');

        // Очищаем старые данные для чистого запуска (безопасно при migrate:fresh)
        Role::where('guard_name', $guard)->delete();
        Permission::where('guard_name', $guard)->delete();

        // 1. Создаем роли
        foreach (Acl::roles() as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => $guard]);
        }

        // 2. Создаем права (включая новое 'confirm user email' из Acl)
        foreach (Acl::permissions() as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => $guard]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // 3. Назначаем права ролям
        $this->assignPermissions($guard);

        $this->command->info('✅ Роли и права успешно настроены и задокументированы в сидере!');
    }

    private function assignPermissions(string $guard): void
    {
        // 1. БАЗОВЫЙ НАБОР ПРАВ ДЛЯ ОБЫЧНОГО АДМИНА
        $adminPermissions = [
            // Меню
            Acl::PERMISSION_VIEW_MENU_ADMINISTRATOR,
            Acl::PERMISSION_VIEW_MENU_PERMISSION,
            Acl::PERMISSION_VIEW_MENU_LANDING,
            Acl::PERMISSION_VIEW_MENU_CHARTS,
            Acl::PERMISSION_VIEW_MENU_ENTITY,
            Acl::PERMISSION_VIEW_MENU_TRAINING,
            Acl::PERMISSION_VIEW_MENU_SMART_LIGHT,

            // Управление
            Acl::PERMISSION_USER_MANAGE,
            Acl::PERMISSION_USER_EDIT_MANAGE,
            Acl::PERMISSION_USER_DELETE_MANAGE,
            Acl::PERMISSION_CONFIRM_EMAIL, // 🔥 Ключевое право для подтверждения email
            Acl::PERMISSION_PERMISSION_MANAGE,
            Acl::PERMISSION_ENTITY_MANAGE,
            Acl::PERMISSION_VIEW_LANDING,
            Acl::PERMISSION_MANAGE_LANDING,
            Acl::PERMISSION_VIEW_SMART_LIGHT,
            Acl::PERMISSION_MANAGE_SMART_LIGHT,
            Acl::PERMISSION_VIEW_SOCIAL_MEDIA_LINKS,
            Acl::PERMISSION_MANAGE_SOCIAL_MEDIA_LINKS,
            Acl::PERMISSION_VIEW_TRAINING,
            Acl::PERMISSION_MANAGE_TRAINING,
            Acl::PERMISSION_VIEW_TRAINING_STATS,
            Acl::PERMISSION_SHARE_TRAINING,
        ];

        // Назначаем права Админу
        $admin = Role::where('name', Acl::ROLE_ADMIN)->where('guard_name', $guard)->first();
        if ($admin) {
            $admin->syncPermissions($adminPermissions);
        }

        // 2. НАБОР ПРАВ ДЛЯ СУПЕР-АДМИНА (База Админа + Уникальные права)
        // Это гарантирует, что любое новое право, добавленное в $adminPermissions,
        // автоматически получит и Супер-админ.
        $superAdminPermissions = array_merge($adminPermissions, [
            Acl::PERMISSION_MANAGE_SUPERADMIN,
            Acl::PERMISSION_VIEW_SYSTEM_LOGS,
            Acl::PERMISSION_MANAGE_SYSTEM_SETTINGS,
        ]);

        $superAdmin = Role::where('name', Acl::ROLE_SUPER_ADMIN)->where('guard_name', $guard)->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions($superAdminPermissions);
        }

        // 3. ОСТАЛЬНЫЕ РОЛИ (Manager, Editor, User, Visitor) остаются со своими ограниченными наборами
        $manager = Role::where('name', Acl::ROLE_MANAGER)->where('guard_name', $guard)->first();
        if ($manager) {
            $manager->syncPermissions([
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
            ]);
        }

        $editor = Role::where('name', Acl::ROLE_EDITOR)->where('guard_name', $guard)->first();
        if ($editor) {
            $editor->syncPermissions([
                Acl::PERMISSION_VIEW_MENU_LANDING,
                Acl::PERMISSION_VIEW_MENU_CHARTS,
                Acl::PERMISSION_VIEW_MENU_ENTITY,
                Acl::PERMISSION_VIEW_MENU_TRAINING,
                Acl::PERMISSION_ARTICLE_MANAGE,
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,
                Acl::PERMISSION_CREATE_TRAINING_LOG,
                Acl::PERMISSION_VIEW_LANDING,
            ]);
        }

        $user = Role::where('name', Acl::ROLE_USER)->where('guard_name', $guard)->first();
        if ($user) {
            $user->syncPermissions([
                Acl::PERMISSION_VIEW_MENU_LANDING,
                Acl::PERMISSION_VIEW_MENU_TRAINING,
                Acl::PERMISSION_VIEW_TRAINING,
                Acl::PERMISSION_MANAGE_OWN_TRAINING,
                Acl::PERMISSION_VIEW_TRAINING_STATS,
                Acl::PERMISSION_VIEW_LANDING,
            ]);
        }

        $visitor = Role::where('name', Acl::ROLE_VISITOR)->where('guard_name', $guard)->first();
        if ($visitor) {
            $visitor->syncPermissions([]);
        }
    }
}
