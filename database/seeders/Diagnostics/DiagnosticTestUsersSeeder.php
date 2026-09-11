<?php

namespace Database\Seeders\Diagnostics;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DiagnosticTestUsersSeeder extends Seeder
{
    /**
     * Идемпотентный: повторный запуск безопасен.
     * Создаёт/обновляет тестовых пользователей для каждой роли.
     */
    public function run(): void
    {
        $roles = [
            'superadmin' => 'Test Superadmin',
            'admin'      => 'Test Admin',
            'manager'    => 'Test Manager',
            'editor'     => 'Test Editor',
            'user'       => 'Test User',
            'visitor'    => 'Test Visitor',
        ];

        foreach ($roles as $roleName => $displayName) {
            $role = Role::where('name', $roleName)->first();

            if (!$role) {
                $this->command->warn("Роль '{$roleName}' не найдена — пропускаем");
                continue;
            }

            $email = "test_{$roleName}@fenix.dev";

            $user = User::firstOrCreate(
                [
                    'email'       => $email,
                    'is_system'   => true,
                    'system_role' => $roleName,
                ],
                [
                    'name'              => $displayName,
                    'password'          => Hash::make('TestPassword123!'),
                    'email_verified_at' => now(),
                ]
            );

            // Синхронизируем роль (на случай если она изменилась)
            $user->syncRoles([$role]);

            $this->command->info("Пользователь '{$email}' (роль: {$roleName}) — OK");
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $this->command->info('Кэш прав сброшен');
    }
}
