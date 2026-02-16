<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\Acl;
use App\Models\SocialMediaLink\SocialMediaLink;
use Spatie\Permission\PermissionRegistrar;

class SocialMediaLinksSeeder extends Seeder
{
    public function run(): void
    {

        $links = [
            [
                'name' => 'Facebook',
                'url' => 'https://www.facebook.com',
                'icon' => 'fab fa-facebook',
            ],
            [
                'name' => 'Instagram',
                'url' => 'https://www.instagram.com',
                'icon' => 'fab fa-instagram',
            ],
            [
                'name' => 'VK',
                'url' => 'https://vk.com',
                'icon' => 'fab fa-vk',
            ],
            [
                'name' => 'Telegram',
                'url' => 'https://t.me',
                'icon' => 'fab fa-telegram',
            ],
            [
                'name' => 'YouTube',
                'url' => 'https://www.youtube.com',
                'icon' => 'fab fa-youtube',
            ],
            [
                'name' => 'TikTok',
                'url' => 'https://www.tiktok.com',
                'icon' => 'fab fa-tiktok',
            ],
            [
                'name' => 'Twitter',
                'url' => 'https://twitter.com',
                'icon' => 'fab fa-twitter',
            ],
            [
                'name' => 'Pinterest',
                'url' => 'https://www.pinterest.com',
                'icon' => 'fab fa-pinterest',
            ],
            [
                'name' => 'WhatsApp',
                'url' => 'https://wa.me',
                'icon' => 'fab fa-whatsapp',
            ],
            [
                'name' => 'LinkedIn',
                'url' => 'https://www.linkedin.com',
                'icon' => 'fab fa-linkedin',
            ],
        ];

        foreach ($links as $link) {
            SocialMediaLink::create($link);
        }

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
