<?php

namespace Database\Seeders\SocialMediaLinks;

use App\Models\Acl;
use Database\Seeders\SocialMediaLinks\SocialMediaLinksTableSeeder;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use function app;
use function config;

class SocialMediaLinksSeeder extends Seeder
{
    public function run(): void
    {
        // Запускаем отдельный сидер для таблицы
        $this->call(SocialMediaLinksTableSeeder::class); // Вызов нового сидера

        // Очищаем кеш
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Получаем guard из конфигурации
        $guard = config('auth.defaults.guard', 'web');

        // Создаем разрешения для SocialMediaLinks
        $permissions = [
            [
                'name' => Acl::PERMISSION_VIEW_SOCIAL_MEDIA_LINKS,
                'guard_name' => $guard
            ],
            [
                'name' => Acl::PERMISSION_MANAGE_SOCIAL_MEDIA_LINKS,
                'guard_name' => $guard
            ],
            [
                'name' => Acl::PERMISSION_MANAGE_OWN_SOCIAL_MEDIA_LINKS,
                'guard_name' => $guard
            ]
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }

        // Назначаем разрешения ролям
        $this->assignPermissions($guard);

        // Очищаем кеш снова
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function assignPermissions(string $guard): void
    {
        // Админ получает полный доступ
        $admin = Role::where('name', Acl::ROLE_ADMIN)
            ->where('guard_name', $guard)
            ->first();
        if ($admin) {
            $admin->givePermissionTo([
                Acl::PERMISSION_VIEW_SOCIAL_MEDIA_LINKS,
                Acl::PERMISSION_MANAGE_SOCIAL_MEDIA_LINKS
            ]);
        }

        // Менеджер получает доступ только к своим ссылкам
        $manager = Role::where('name', Acl::ROLE_MANAGER)
            ->where('guard_name', $guard)
            ->first();
        if ($manager) {
            $manager->givePermissionTo([
                Acl::PERMISSION_MANAGE_OWN_SOCIAL_MEDIA_LINKS
            ]);
        }
    }
}
