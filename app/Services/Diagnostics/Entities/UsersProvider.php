<?php

namespace App\Services\Diagnostics\Entities;

use App\Models\User;
use App\Services\Diagnostics\AbstractEntityProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UsersProvider extends AbstractEntityProvider
{
    public function key(): string
    {
        return 'users';
    }

    public function capabilities(): array
    {
        // inspector/crud/simulator добавятся в B3/B4 вместе с реализацией
        return ['checks'];
    }

    public function checks(): array
    {
        return [
            $this->checkFillable(),
            $this->checkColumns(),
            $this->checkFrontendUrl(),
            $this->checkRoutes(),
            $this->checkPermission(),
        ];
    }

    /** Поля email-потока в $fillable модели User. */
    private function checkFillable(): array
    {
        $fillable = (new User())->getFillable();

        $missing = array_diff([
            'email_verified_at',
            'pending_new_email',
            'pending_email_token',
            'pending_email_expires_at',
            'old_email_confirmed',
            'old_email_confirm_method',
            'new_email_confirm_method',
        ], $fillable);

        if (empty($missing)) {
            return $this->check('users.fillable', 'ok', 'Все поля email-потока присутствуют в User::$fillable');
        }

        return $this->check(
            'users.fillable',
            'fail',
            'Отсутствуют в $fillable: ' . implode(', ', $missing),
            'Добавь поля в protected $fillable модели User',
            $this->cliCommand('users/diag_user_statuses.php')
        );
    }

    /** Колонки email-потока в таблице users. */
    private function checkColumns(): array
    {
        $missing = [];
        foreach ([
                     'pending_new_email',
                     'pending_email_token',
                     'pending_email_expires_at',
                     'old_email_confirmed',
                     'old_email_confirm_method',
                     'new_email_confirm_method',
                 ] as $column) {
            if (!Schema::hasColumn('users', $column)) {
                $missing[] = $column;
            }
        }

        if (empty($missing)) {
            return $this->check('users.columns', 'ok', 'Колонки email-потока существуют в таблице users');
        }

        return $this->check(
            'users.columns',
            'fail',
            'Отсутствуют колонки: ' . implode(', ', $missing),
            'Накати миграцию add_email_confirm_methods_to_users_table',
            $this->cliCommand('users/diag_user_statuses.php')
        );
    }

    /** frontend.url отличается от app.url (ссылки писем ведут на Vue SPA). */
    private function checkFrontendUrl(): array
    {
        $frontend = (string) config('app.frontend.url', '');
        $appUrl = (string) config('app.url', '');

        if ($frontend !== '' && $frontend !== $appUrl) {
            return $this->check('users.frontend_url', 'ok', "frontend.url = {$frontend}");
        }

        return $this->check(
            'users.frontend_url',
            'fail',
            "frontend.url пуст или совпадает с app.url ({$appUrl}) — ссылки из писем уйдут на публичное приложение",
            'Проверь VITE_APP_URL в .env и секцию frontend в config/app.php',
            $this->cliCommand('users/diag_user_statuses.php')
        );
    }

    /** Роуты email-потока зарегистрированы. */
    private function checkRoutes(): array
    {
        $uris = collect(Route::getRoutes()->getRoutes())->map(fn($route) => $route->uri());

        $required = [
            'users/confirm-old-email/' => 'confirm-old-email/{token}',
            'users/confirm-new-email/' => 'confirm-new-email/{token}',
            'users/me/reverify-email' => 'me/reverify-email',
        ];

        $missing = [];
        foreach ($required as $needle => $label) {
            if (!$uris->contains(fn($uri) => str_contains($uri, $needle))) {
                $missing[] = $label;
            }
        }

        if (empty($missing)) {
            return $this->check('users.routes', 'ok', 'Все роуты email-потока зарегистрированы');
        }

        return $this->check(
            'users.routes',
            'fail',
            'Не найдены роуты: ' . implode(', ', $missing),
            'Проверь секции 3.1 и 3.2 в routes/api.php'
        );
    }

    /** Право confirm user email существует и выдано admin/superadmin. */
    private function checkPermission(): array
    {
        $permissionName = 'confirm user email';

        if (!Permission::where('name', $permissionName)->exists()) {
            return $this->check(
                'users.permission',
                'fail',
                "Право '{$permissionName}' не существует",
                'Создай и выдай право ролям admin/superadmin',
                $this->cliCommand('permissions/grant_confirm_email_permission.php')
            );
        }

        $missingRoles = [];
        foreach (['admin', 'superadmin'] as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if (!$role || !$role->hasPermissionTo($permissionName)) {
                $missingRoles[] = $roleName;
            }
        }

        if (empty($missingRoles)) {
            return $this->check('users.permission', 'ok', "Право '{$permissionName}' существует и выдано admin/superadmin");
        }

        return $this->check(
            'users.permission',
            'warn',
            'Право существует, но не выдано ролям: ' . implode(', ', $missingRoles),
            'Выдай право ролям через грант-скрипт',
            $this->cliCommand('permissions/grant_confirm_email_permission.php')
        );
    }
}
