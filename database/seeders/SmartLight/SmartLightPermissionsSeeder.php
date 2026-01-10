<?php

namespace Database\Seeders\SmartLight;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\Acl;

class SmartLightPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Создаем разрешения
        $permissions = [
            Acl::PERMISSION_VIEW_SMART_LIGHT,
            Acl::PERMISSION_MANAGE_SMART_LIGHT,
            Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT
        ];

        foreach ($permissions as $permissionName) {
            Permission::updateOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web'
            ]);
        }

        // Назначаем разрешения ролям
        $adminRole = Role::findByName(Acl::ROLE_ADMIN);
        $userManagerRole = Role::findByName(Acl::ROLE_MANAGER);
        $userRole = Role::findByName(Acl::ROLE_USER);
        $superAdminRole = Role::findByName(Acl::ROLE_SUPER_ADMIN);

        if ($adminRole) {
            $adminRole->syncPermissions([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT
            ]);
        }

        if ($userManagerRole) {
            $userManagerRole->syncPermissions([
                Acl::PERMISSION_VIEW_SMART_LIGHT,
                Acl::PERMISSION_MANAGE_SMART_LIGHT
            ]);
        }

        if ($userRole) {
            $userRole->syncPermissions([
                Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT
            ]);
        }

        if ($superAdminRole) {
            $superAdminRole->syncPermissions(Permission::all());
        }
    }
}
