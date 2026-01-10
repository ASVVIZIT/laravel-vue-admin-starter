<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\Acl;
use Spatie\Permission\PermissionRegistrar;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Получаем правильный guard из конфигурации
        $guard = config('auth.defaults.guard', 'web');

        // Сбрасываем кеш перед использованием
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $mailStat = config('content.mail_stat');
        $mailStatPass = config('content.mail_stat_pass');

        // Суперадмин (основной)
        $superAdmin = User::updateOrCreate(
            ['email' => config('content.admin_email')],
            [
                'name' => config('content.admin_name'),
                'password' => Hash::make(config('content.admin_password')),
                'status' => true,
                'sex' => 0,
                'birthday' => '2006-01-02 15:04:05',
                'description' => 'Talk is cheap. Show me the code',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]
        );

        // Ищем роль с правильным guard'ом
        $superAdminRole = Role::where('name', Acl::ROLE_SUPER_ADMIN)
            ->where('guard_name', $guard)
            ->first();

        if ($superAdminRole) {
            $superAdmin->syncRoles([$superAdminRole]);
        }

        // Тестовые пользователи
        $testUsers = [
            [
                'name' => 'Admin2',
                'email' => 'admin2' . $mailStat,
                'role' => Acl::ROLE_ADMIN
            ],
            [
                'name' => 'Admin3',
                'email' => 'admin3' . $mailStat,
                'role' => Acl::ROLE_ADMIN
            ],
            [
                'name' => 'Manager',
                'email' => 'manager' . $mailStat,
                'role' => Acl::ROLE_MANAGER
            ],
            [
                'name' => 'Editor',
                'email' => 'editor' . $mailStat,
                'role' => Acl::ROLE_EDITOR
            ],
            [
                'name' => 'User',
                'email' => 'user' . $mailStat,
                'role' => Acl::ROLE_USER
            ],
            [
                'name' => 'Visitor',
                'email' => 'visitor' . $mailStat,
                'role' => Acl::ROLE_VISITOR
            ],
            [
                'name' => 'User Manager',
                'email' => 'usermanager' . $mailStat,
                'role' => Acl::ROLE_MANAGER
            ]
        ];

        foreach ($testUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($mailStatPass),
                    'status' => true,
                    'sex' => 1,
                    'birthday' => now()->subYears(30),
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            // Ищем роль с правильным guard'ом
            $role = Role::where('name', $userData['role'])
                ->where('guard_name', $guard)
                ->first();

            if ($role) {
                $user->syncRoles([$role]);
            }
        }
    }
}
