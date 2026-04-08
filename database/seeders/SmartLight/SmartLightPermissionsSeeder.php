<?php

namespace Database\Seeders\SmartLight;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\Acl; // ✅ Импортируем класс с константами

/**
 * ============================================================================
 * SMARTLIGHT — ПРАВА ДОСТУПА (СОГЛАСНО ACL МОДЕЛИ)
 * ============================================================================
 * 📁 Путь: database/seeders/SmartLight/SmartLightPermissionsSeeder.php
 * ✅ Permissions: Только константы из App\Models\Acl
 * ✅ Roles: Только константы из App\Models\Acl (без выдумок!)
 * ✅ Idempotent: Безопасный повторный запуск
 * ============================================================================
 */

class SmartLightPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // ===== 1. СОЗДАЁМ ПРАВА (используем ТОЛЬКО константы из Acl) =====
        $smartLightPermissions = [
            Acl::PERMISSION_VIEW_SMART_LIGHT,           // 'view smart light'
            Acl::PERMISSION_MANAGE_SMART_LIGHT,         // 'manage smart light'
            Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,     // 'manage own smart light'
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

        // ===== 2. ПОЛУЧАЕМ РОЛИ (используем ТОЛЬКО константы из Acl) =====
        // Важно: в Acl ROLE_SUPER_ADMIN = 'superadmin' (без дефиса!)
        $roles = [
            Acl::ROLE_SUPER_ADMIN => Role::findByName(Acl::ROLE_SUPER_ADMIN, 'web'),
            Acl::ROLE_ADMIN       => Role::findByName(Acl::ROLE_ADMIN, 'web'),
            Acl::ROLE_MANAGER     => Role::findByName(Acl::ROLE_MANAGER, 'web'),
            Acl::ROLE_USER        => Role::findByName(Acl::ROLE_USER, 'web'),
        ];

        // ===== 3. НАЗНАЧАЕМ ПРАВА РОЛЯМ (логика доступа) =====

        // 👑 SuperAdmin: все права системы (включая SmartLight)
        if ($roles[Acl::ROLE_SUPER_ADMIN]) {
            $roles[Acl::ROLE_SUPER_ADMIN]->syncPermissions(Permission::all());
        }

        // 👨‍💼 Admin: полный доступ к SmartLight (все устройства)
        if ($roles[Acl::ROLE_ADMIN]) {
            $roles[Acl::ROLE_ADMIN]->syncPermissions([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT,
            ]);
        }

        // 👷 Manager: полный доступ к SmartLight (все устройства)
        if ($roles[Acl::ROLE_MANAGER]) {
            $roles[Acl::ROLE_MANAGER]->syncPermissions([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT,
            ]);
        }

        // 👤 User: только просмотр + управление СВОИМИ устройствами
        if ($roles[Acl::ROLE_USER]) {
            $roles[Acl::ROLE_USER]->syncPermissions([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
            ]);
        }

        // 👁️ Visitor: только просмотр (опционально, если нужна такая роль)
        // if ($roles[Acl::ROLE_VISITOR]) { ... }

        // ===== 4. ВЫВОД СТАТИСТИКИ (реальные цифры из БД) =====
        $this->printStatistics();
    }

    /**
     * Вывод РЕАЛЬНОЙ статистики прав (не выдуманные цифры!)
     */
    private function printStatistics(): void
    {
        // Считаем права, которые относятся к SmartLight
        $smartLightPermissionCount = Permission::query()
            ->whereIn('name', [
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT,
            ])
            ->count();

        // Считаем роли, у которых есть права на SmartLight
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
