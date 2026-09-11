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
    /**
     * ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ для всех проверок полей.
     * Каждая группа описывает:
     *   - id: уникальный идентификатор проверки
     *   - title_key / description_key: ключи переводов для FixActionModal
     *   - fillable: поля, которые ДОЛЖНЫ быть в User::$fillable
     *   - columns: колонки, которые ДОЛЖНЫ быть в таблице users
     *   - cli / file: инструкции по исправлению
     *
     * При добавлении нового поля — правка ТОЛЬКО здесь.
     */
    protected const FIELD_GROUPS = [
        'base' => [
            'id' => 'users.base_fields',
            'title_key' => 'diagnostics.fix.users_base_fields_title',
            'description_key' => 'diagnostics.fix.users_base_fields_desc',
            'fillable' => ['name', 'email', 'password', 'email_verified_at', 'remember_token'],
            'columns' => ['name', 'email', 'password', 'email_verified_at', 'remember_token'],
            'cli' => 'php artisan migrate',
            'file' => 'app/Models/User.php',
        ],
        'email_flow' => [
            'id' => 'users.email_flow',
            'title_key' => 'diagnostics.fix.users_email_flow_title',
            'description_key' => 'diagnostics.fix.users_email_flow_desc',
            'fillable' => [
                'pending_new_email',
                'pending_email_token',
                'pending_email_expires_at',
                'old_email_confirmed',
                'old_email_confirm_method',
                'new_email_confirm_method',
            ],
            'columns' => [
                'pending_new_email',
                'pending_email_token',
                'pending_email_expires_at',
                'old_email_confirmed',
                'old_email_confirm_method',
                'new_email_confirm_method',
            ],
            'cli' => 'php artisan migrate',
            'file' => 'app/Models/User.php',
        ],
        'system' => [
            'id' => 'users.system_fields',
            'title_key' => 'diagnostics.fix.users_system_fields_title',
            'description_key' => 'diagnostics.fix.users_system_fields_desc',
            'fillable' => ['is_system', 'system_role'],
            'columns' => ['is_system', 'system_role'],
            'cli' => 'php artisan migrate',
            'file' => 'app/Models/User.php',
        ],
    ];

    /** Касты, которые должны быть в User::$casts. */
    protected const REQUIRED_CASTS = [
        'email_verified_at' => 'datetime',
        'is_system' => 'boolean',
    ];

    /** Traits, которые должны быть подключены в User. */
    protected const REQUIRED_TRAITS = [
        'Illuminate\Notifications\Notifiable',
        'Illuminate\Database\Eloquent\SoftDeletes',
        'Spatie\Permission\Traits\HasRoles',
    ];

    public function key(): string
    {
        return 'users';
    }

    public function capabilities(): array
    {
        return ['checks'];
    }

    public function checks(): array
    {
        $checks = [];

        // Динамически генерируем проверки по группам полей из FIELD_GROUPS
        foreach (array_keys(self::FIELD_GROUPS) as $groupKey) {
            $checks[] = $this->checkFieldGroup($groupKey);
        }

        // Остальные проверки (не про поля)
        $checks[] = $this->checkTraits();
        $checks[] = $this->checkCasts();
        $checks[] = $this->checkFrontendUrl();
        $checks[] = $this->checkRoutes();
        $checks[] = $this->checkPermission();

        return $checks;
    }

    // ========================================================================
    // ПРОВЕРКИ ГРУПП ПОЛЕЙ (один метод на все группы)
    // ========================================================================

    /**
     * Универсальная проверка группы полей из FIELD_GROUPS.
     * Проверяет fillable и columns, формирует детальный отчёт
     * и машиночитаемый список missing_fillable для кнопки копирования.
     */
    private function checkFieldGroup(string $groupKey): array
    {
        $group = self::FIELD_GROUPS[$groupKey];
        $user = new User();
        $fillable = $user->getFillable();

        // Проверяем fillable
        $missingFillable = array_diff($group['fillable'], $fillable);

        // Проверяем колонки
        $missingColumns = [];
        foreach ($group['columns'] as $column) {
            if (!Schema::hasColumn('users', $column)) {
                $missingColumns[] = $column;
            }
        }

        // Если всё на месте
        if (empty($missingFillable) && empty($missingColumns)) {
            $check = $this->check(
                $group['id'],
                'ok',
                sprintf(
                    'Все поля группы "%s" присутствуют в $fillable и в таблице users',
                    $groupKey
                )
            );
            $check['missing_fillable'] = [];

            return $check;
        }

        // Собираем детализацию проблем
        $parts = [];
        if (!empty($missingFillable)) {
            $parts[] = 'Отсутствуют в $fillable: ' . implode(', ', $missingFillable);
        }
        if (!empty($missingColumns)) {
            $parts[] = 'Отсутствуют колонки: ' . implode(', ', $missingColumns);
        }

        $check = $this->check($group['id'], 'fail', implode('; ', $parts));
        // Машиночитаемый список для кнопки «Скопировать список» на фронте
        $check['missing_fillable'] = array_values($missingFillable);

        return $check;
    }

    // ========================================================================
    // ПРОВЕРКИ НЕ ПРО ПОЛЯ
    // ========================================================================

    private function checkTraits(): array
    {
        $traits = class_uses_recursive(new User());
        $missing = [];
        foreach (self::REQUIRED_TRAITS as $trait) {
            if (!in_array($trait, $traits)) {
                $missing[] = class_basename($trait);
            }
        }

        if (empty($missing)) {
            return $this->check('users.traits', 'ok', 'Все необходимые traits подключены');
        }

        return $this->check(
            'users.traits',
            'fail',
            'Отсутствуют traits: ' . implode(', ', $missing)
        );
    }

    private function checkCasts(): array
    {
        $casts = (new User())->getCasts();
        $missing = [];
        foreach (self::REQUIRED_CASTS as $field => $expectedType) {
            $actual = $casts[$field] ?? null;
            if ($actual !== $expectedType) {
                $missing[] = sprintf('%s (ожидается %s, есть %s)', $field, $expectedType, $actual ?: 'null');
            }
        }

        if (empty($missing)) {
            return $this->check('users.casts', 'ok', 'Все касты корректны');
        }

        return $this->check(
            'users.casts',
            'warn',
            'Некорректные касты: ' . implode(', ', $missing)
        );
    }

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
            "frontend.url пуст или совпадает с app.url ({$appUrl})"
        );
    }

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
            'Не найдены роуты: ' . implode(', ', $missing)
        );
    }

    private function checkPermission(): array
    {
        $permissionName = 'confirm user email';

        if (!Permission::where('name', $permissionName)->exists()) {
            return $this->check(
                'users.permission',
                'fail',
                "Право '{$permissionName}' не существует"
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
            'Право существует, но не выдано ролям: ' . implode(', ', $missingRoles)
        );
    }

    // ========================================================================
    // ИНСТРУКЦИИ ПО ИСПРАВЛЕНИЮ (читает тот же FIELD_GROUPS)
    // ========================================================================

    public function getFixInstructions(string $checkId): ?array
    {
        // 1. Сначала ищем в группах полей (единый источник истины)
        foreach (self::FIELD_GROUPS as $group) {
            if ($group['id'] === $checkId) {
                return [
                    'title_key' => $group['title_key'],
                    'description_key' => $group['description_key'],
                    'cli' => $group['cli'] ?? null,
                    'file' => $group['file'] ?? null,
                ];
            }
        }

        // 2. Затем — отдельные инструкции для проверок не про поля
        $map = [
            'users.traits' => [
                'title_key' => 'diagnostics.fix.users_traits_title',
                'description_key' => 'diagnostics.fix.users_traits_desc',
                'cli' => null,
                'file' => 'app/Models/User.php',
            ],
            'users.casts' => [
                'title_key' => 'diagnostics.fix.users_casts_title',
                'description_key' => 'diagnostics.fix.users_casts_desc',
                'cli' => null,
                'file' => 'app/Models/User.php',
            ],
            'users.frontend_url' => [
                'title_key' => 'diagnostics.fix.users_frontend_url_title',
                'description_key' => 'diagnostics.fix.users_frontend_url_desc',
                'cli' => null,
                'file' => 'config/app.php',
            ],
            'users.routes' => [
                'title_key' => 'diagnostics.fix.users_routes_title',
                'description_key' => 'diagnostics.fix.users_routes_desc',
                'cli' => 'php artisan route:list --name=diagnostics',
                'file' => null,
            ],
            'users.permission' => [
                'title_key' => 'diagnostics.fix.users_permission_title',
                'description_key' => 'diagnostics.fix.users_permission_desc',
                'cli' => 'php artisan db:seed --class=Database\\Seeders\\Diagnostics\\DiagnosticPermissionsSeeder',
                'file' => null,
            ],
        ];

        return $map[$checkId] ?? null;
    }
}
