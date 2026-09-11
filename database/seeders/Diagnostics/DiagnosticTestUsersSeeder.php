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
     *
     * 🔥 Использует forceCreate/forceFill вместо firstOrCreate —
     * обходит $fillable модели User. Сидер должен работать,
     * даже когда конфигурация модели сломана.
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

            // Ищем существующего тестового пользователя
            $user = User::where('email', $email)
                ->where('is_system', true)
                ->where('system_role', $roleName)
                ->first();

            if ($user) {
                // Обновляем существующего — forceFill обходит $fillable
                $user->forceFill([
                    'name'              => $displayName,
                    'password'          => Hash::make('TestPassword123!'),
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ])->save();

                $action = 'обновлён';
            } else {
                // Создаём нового — forceCreate обходит $fillable
                $user = User::forceCreate([
                    'name'              => $displayName,
                    'email'             => $email,
                    'password'          => Hash::make('TestPassword123!'),
                    'is_system'         => true,
                    'system_role'       => $roleName,
                    'email_verified_at' => now(),
                ]);

                $action = 'создан';
            }

            // syncRoles работает через модель, mass assignment не задействован
            $user->syncRoles([$role]);

            $this->command->info("Пользователь '{$email}' (роль: {$roleName}) — {$action}");
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $this->command->info('Кэш прав сброшен');
    }
}
