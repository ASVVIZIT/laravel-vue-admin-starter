<?php

/**
 * ПРОВЕРКА: существует ли право 'confirm user email' и выдано ли оно ролям admin / superadmin.
 *
 * Запуск: php diagnostics/permissions/check_confirm_email_permission.php
 */

if (php_sapi_name() !== 'cli') {
    exit('CLI only');
}

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

$permissionName = 'confirm user email';

$exists = Permission::where('name', $permissionName)->exists();
echo 'Permission exists: ' . ($exists ? 'YES' : 'NO') . PHP_EOL;

foreach (['admin', 'superadmin'] as $roleName) {
    $role = Role::where('name', $roleName)->first();
    if (!$role) {
        echo 'Role ' . $roleName . ': NOT FOUND' . PHP_EOL;
        continue;
    }
    echo 'Role ' . $roleName . ' has permission: ' . ($role->hasPermissionTo($permissionName) ? 'YES' : 'NO') . PHP_EOL;
}
