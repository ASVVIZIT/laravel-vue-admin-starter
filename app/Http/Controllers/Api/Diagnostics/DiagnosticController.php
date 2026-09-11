<?php

namespace App\Http\Controllers\Api\Diagnostics;

use App\Contracts\Diagnostics\EntityDiagnosticProvider;
use App\Http\Controllers\Api\BaseController;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Services\Diagnostics\EmailInspectorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class DiagnosticController extends BaseController
{
    /** Реестр сущностей и возможностей для вкладок UI. */
    public function config(): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }

        $entities = [];
        foreach (config('diagnostics.entities', []) as $key => $definition) {
            $entities[] = [
                'key' => $key,
                'capabilities' => $this->provider($key)->capabilities(),
                'cli' => $definition['cli'] ?? null,
            ];
        }

        return responseSuccess([
            'enabled' => (bool) config('diagnostics.enabled'),
            'outbox_ttl' => (int) config('diagnostics.outbox_ttl'),
            'entities' => $entities,
        ]);
    }

    /** Чек-лист сущности со сводкой ok/warn/fail. */
    public function checks(string $entity): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $provider = $this->provider($entity);
        $checks = $provider->checks();

        // Добавляем инструкции по исправлению (если есть)
        foreach ($checks as &$check) {
            $check['fix_instructions'] = $provider->getFixInstructions($check['id']);
        }
        unset($check);

        $summary = [
            'ok' => count(array_filter($checks, fn(array $item): bool => $item['status'] === 'ok')),
            'warn' => count(array_filter($checks, fn(array $item): bool => $item['status'] === 'warn')),
            'fail' => count(array_filter($checks, fn(array $item): bool => $item['status'] === 'fail')),
        ];

        return responseSuccess([
            'entity' => $entity,
            'checks' => $checks,
            'summary' => $summary,
        ]);
    }

    /** Карточка идентификатора (B1: заглушка провайдера, реализация в B3). */
    public function inspect(string $entity, Request $request): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $validator = Validator::make($request->all(), [
            'value' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return responseFailed($validator->errors()->first(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return responseSuccess([
            'entity' => $entity,
            'card' => $this->provider($entity)->inspect($request->input('value')),
        ]);
    }

    /** CRUD-сюит (B1: пустой отчёт, реализация в B2-бэке P2). */
    public function crud(string $entity): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $report = $this->provider($entity)->crudSuite();

        return responseSuccess(
            ['entity' => $entity, 'report' => $report],
            empty($report) ? 'CRUD-сюит для сущности ещё не реализован' : 'CRUD-сюит завершён'
        );
    }

    /** Шаг симуляции (B1: заглушка провайдера, реализация в B4). */
    public function simulate(string $entity, Request $request): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $validator = Validator::make($request->all(), [
            'step' => ['required', 'string', 'max:50'],
            'payload' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return responseFailed($validator->errors()->first(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return responseSuccess([
            'entity' => $entity,
            'result' => $this->provider($entity)->simulate($request->input('step'), $request->input('payload', [])),
        ]);
    }

    // ========================================================================
    // ПРИВАТНЫЕ ХЕЛПЕРЫ
    // ========================================================================

    private function guardEnabled(): ?JsonResponse
    {
        if (config('diagnostics.enabled')) {
            return null;
        }

        return responseFailed('Диагностика отключена', Response::HTTP_NOT_FOUND);
    }

    private function guardEntity(string $entity): ?JsonResponse
    {
        $validator = Validator::make(
            ['entity' => $entity],
            ['entity' => ['required', 'string', Rule::in(array_keys(config('diagnostics.entities', [])))]]
        );

        if ($validator->fails()) {
            return responseFailed('Неизвестная сущность диагностики: ' . $entity, Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return null;
    }

    private function provider(string $entity): EntityDiagnosticProvider
    {
        $definition = config("diagnostics.entities.{$entity}");

        return app($definition['provider']);
    }

    /**
     * Инспектор email: полная карточка без мутаций.
     */
    public function inspectEmail(Request $request): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }

        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:255'],
        ]);

        if ($validator->fails()) {
            return responseFailed($validator->errors()->first(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $inspector = app(EmailInspectorService::class);
        $card = $inspector->inspect($request->input('email'));

        return responseSuccess(['card' => $card]);
    }

    /**
     * Список системных (тестовых) пользователей.
     */
    public function systemUsers(): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }

        $users = User::withTrashed()
            ->where('is_system', true)
            ->orderBy('system_role')
            ->get([
                'id', 'name', 'email', 'system_role',
                'email_verified_at', 'deleted_at',
            ])
            ->map(function ($user) {
                $banned = LoginAttempt::where('email', $user->email)
                    ->where('is_banned', true)
                    ->exists();

                return [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'system_role'       => $user->system_role,
                    'email_verified_at' => $user->email_verified_at,
                    'deleted_at'        => $user->deleted_at,
                    'banned'            => $banned,
                ];
            });

        return responseSuccess(['users' => $users]);
    }

    /**
     * Сброс и пересоздание системных (тестовых) пользователей.
     *
     * 🔥 Использует forceCreate/forceFill вместо create — обходит $fillable модели User.
     * Сброс должен работать даже когда конфигурация модели сломана (это диагностический инструмент).
     */
    public function resetSystemUsers(): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }

        // Пре-проверка: колонки, которые нужны для создания тестовых пользователей
        $requiredColumns = ['name', 'email', 'password', 'is_system', 'system_role', 'email_verified_at'];

        $missingColumns = array_values(array_filter(
            $requiredColumns,
            fn (string $col) => !\Illuminate\Support\Facades\Schema::hasColumn('users', $col)
        ));

        if (!empty($missingColumns)) {
            return responseFailed(
                'Сброс невозможен: в таблице users не хватает колонок: ' .
                implode(', ', $missingColumns) .
                '. Накати миграции и повтори — подсказка во вкладке «Пользователи» диагностики.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $roles = [
            'superadmin' => 'Test Superadmin',
            'admin'      => 'Test Admin',
            'manager'    => 'Test Manager',
            'editor'     => 'Test Editor',
            'user'       => 'Test User',
            'visitor'    => 'Test Visitor',
        ];

        try {
            // 1. Полностью удаляем старых системных пользователей (forceDelete, чтобы не было конфликтов unique email)
            User::where('is_system', true)->forceDelete();

            // 2. Создаем их заново по образцу сидера
            foreach ($roles as $roleName => $displayName) {
                $role = \Spatie\Permission\Models\Role::where('name', $roleName)->first();

                if (!$role) {
                    \Log::warning("Диагностика: роль '{$roleName}' не найдена — пропускаем создание тестового пользователя");
                    continue;
                }

                $email = "test_{$roleName}@fenix.dev";

                // 🔥 forceCreate обходит $fillable — сброс работает даже при битой модели
                $user = User::forceCreate([
                    'name'              => $displayName,
                    'email'             => $email,
                    'password'          => \Illuminate\Support\Facades\Hash::make('TestPassword123!'),
                    'email_verified_at' => now(),
                    'is_system'         => true,
                    'system_role'       => $roleName,
                ]);

                $user->assignRole($role);
            }

            // Сбрасываем кэш прав Spatie на всякий случай
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return responseSuccess(['message' => 'Системные пользователи успешно удалены и созданы заново']);

        } catch (\Illuminate\Database\Eloquent\MassAssignmentException $e) {
            // Страховка: сидер использует forceCreate, но вдруг какой-то хук
            // внутри модели снова вызовет create/update с mass assignment
            return responseFailed(
                'Модель User не принимает поля из-за защиты mass assignment. ' .
                'Открой вкладку «Пользователи» в диагностике — проверка полей покажет, ' .
                'чего не хватает в $fillable, и даст кнопку «Скопировать список».',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        } catch (\Illuminate\Database\QueryException $e) {
            return responseFailed(
                'Ошибка базы данных при сбросе: структура таблицы users не совпадает с ожидаемой. ' .
                'Открой вкладку «Пользователи» в диагностике и исправь проверки колонок.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        } catch (\Exception $e) {
            return responseFailed(
                'Непредвиденная ошибка при сбросе: ' . $e->getMessage(),
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
