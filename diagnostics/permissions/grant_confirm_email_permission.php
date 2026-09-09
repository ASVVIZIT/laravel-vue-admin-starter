<?php

/**
 * Создаёт право 'confirm user email' (если отсутствует) и выдаёт его ролям admin / superadmin.
 * Сбрасывает кэш прав Spatie.
 *
 * Запуск: php diagnostics/permissions/grant_confirm_email_permission.php
 */

if (php_sapi_name() !== 'cli') {
    exit('CLI only');
}

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

$permissionName = 'confirm user email';

$permission = Permission::firstOrCreate(
    ['name' => $permissionName, 'guard_name' => 'web']
);
echo 'Permission exists (id: ' . $permission->id . ')' . PHP_EOL;

foreach (['admin', 'superadmin'] as $roleName) {
    $role = Role::where('name', $roleName)->first();
    if ($role) {
        $role->givePermissionTo($permission);
        echo 'Role ' . $roleName . ': granted' . PHP_EOL;
    } else {
        echo 'Role ' . $roleName . ': NOT FOUND' . PHP_EOL;
    }
}

app()[PermissionRegistrar::class]->forgetCachedPermissions();
echo 'Permission cache cleared' . PHP_EOL;
echo 'Done!' . PHP_EOL;
