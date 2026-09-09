<?php

namespace Database\Seeders\Diagnostics;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DiagnosticPermissionsSeeder extends Seeder
{
    /** Идемпотентный: повторный запуск безопасен. */
    public function run(): void
    {
        $permissions = [
            'view menu diagnostics',
            'view diagnostics',
            'manage diagnostics',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
            echo "Permission '{$name}' OK" . PHP_EOL;
        }

        foreach (['superadmin', 'admin'] as $roleName) {
            $role = Role::where('name', $roleName)->first();

            if (!$role) {
                echo "Role '{$roleName}' not found — skipped" . PHP_EOL;
                continue;
            }

            $role->givePermissionTo($permissions);
            echo "Role '{$roleName}' granted" . PHP_EOL;
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        echo 'Permission cache cleared' . PHP_EOL;
    }
}
