<?php

namespace Database\Seeders\SmartLight;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\Acl;

/**
 * ============================================================================
 * SMARTLIGHT — ПРАВА ДОСТУПА (СОГЛАСНО ACL МОДЕЛИ)
 * ============================================================================
 * 📁 Путь: database/seeders/SmartLight/SmartLightPermissionsSeeder.php
 * ✅ Permissions: Только константы из App\Models\Acl
 * ✅ Roles: Только константы из App\Models\Acl
 * ✅ Idempotent: Безопасный повторный запуск (используем givePermissionTo)
 * ============================================================================
 */

class SmartLightPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // ===== 1. СОЗДАЁМ ПРАВА (используем ТОЛЬКО константы из Acl) =====
        $smartLightPermissions = [
            Acl::PERMISSION_VIEW_SMART_LIGHT,
            Acl::PERMISSION_MANAGE_SMART_LIGHT,
            Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
        ];

        foreach ($smartLightPermissions as $permissionName) {
            Permission::updateOrCreate(
                [
                    'name' => $permissionName,
                    'guard_name' => 'web'
                ],
                ['updated_at' => now()]
            );
        }

        // ===== 2. ПОЛУЧАЕМ РОЛИ =====
        $roles = [
            Acl::ROLE_SUPER_ADMIN => Role::findByName(Acl::ROLE_SUPER_ADMIN, 'web'),
            Acl::ROLE_ADMIN       => Role::findByName(Acl::ROLE_ADMIN, 'web'),
            Acl::ROLE_MANAGER     => Role::findByName(Acl::ROLE_MANAGER, 'web'),
            Acl::ROLE_USER        => Role::findByName(Acl::ROLE_USER, 'web'),
        ];

        // ===== 3. НАЗНАЧАЕМ ПРАВА РОЛЯМ (ИСПОЛЬЗУЕМ givePermissionTo, ЧТОБЫ НЕ СТИРАТЬ ДРУГИЕ ПРАВА!) =====

        // 👑 SuperAdmin: все права системы
        if ($roles[Acl::ROLE_SUPER_ADMIN]) {
            $roles[Acl::ROLE_SUPER_ADMIN]->givePermissionTo(Permission::all());
        }

        // 👨‍💼 Admin: добавляем права SmartLight к уже существующим
        if ($roles[Acl::ROLE_ADMIN]) {
            $roles[Acl::ROLE_ADMIN]->givePermissionTo([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT,
            ]);
        }

        // 👷 Manager: добавляем права SmartLight к уже существующим
        if ($roles[Acl::ROLE_MANAGER]) {
            $roles[Acl::ROLE_MANAGER]->givePermissionTo([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT,
            ]);
        }

        // 👤 User: добавляем права SmartLight к уже существующим
        if ($roles[Acl::ROLE_USER]) {
            $roles[Acl::ROLE_USER]->givePermissionTo([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
            ]);
        }

        // ===== 4. ВЫВОД СТАТИСТИКИ =====
        $this->printStatistics();
    }

    private function printStatistics(): void
    {
        $smartLightPermissionCount = Permission::query()
            ->whereIn('name', [
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
            ])
            ->count();

        $roleCount = Role::query()
            ->whereHas('permissions', function ($query) {
                $query->whereIn('name', [
                    Acl::PERMISSION_VIEW_SMART_LIGHT,
                    Acl::PERMISSION_MANAGE_SMART_LIGHT,
                    Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
                ]);
            })
            ->count();

        $this->command->info("   🔐 <bg=blue;fg=white> ПРАВА SMARTLIGHT </>");
        $this->command->line("      📋 Права: <fg=green>{$smartLightPermissionCount}</>/<fg=cyan>3</>");
        $this->command->line("      👥 Ролей с доступом: <fg=green>{$roleCount}</>");
        $this->command->newLine();
    }
}
