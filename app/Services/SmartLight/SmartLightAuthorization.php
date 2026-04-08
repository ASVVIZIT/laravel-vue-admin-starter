<?php

namespace App\Services\SmartLight;

use App\Models\Acl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

/**
 * ============================================================================
 * SMARTLIGHT AUTHORIZATION — СЕРВИС ПРОВЕРКИ ПРАВ (без изменения User)
 * ============================================================================
 * 📁 Путь: app/Services/SmartLight/SmartLightAuthorization.php
 * ✅ Назначение: Изолированная проверка прав для SmartLight
 * ✅ Не требует изменений в app/Models/User.php
 * ✅ Работает с кэшем Spatie Permission через Gate::check()
 * ============================================================================
 */

class SmartLightAuthorization
{
    /**
     * Проверка: может ли пользователь управлять ВСЕМИ устройствами
     *
     * @param \App\Models\User|null $user
     * @return bool
     */
    public static function canManageAll($user = null): bool
    {
        $user = $user ?: Auth::user();
        if (!$user) return false;

        // ✅ Прямая проверка через Gate — работает с любым User, использующим HasRoles
        return Gate::check(Acl::PERMISSION_MANAGE_SMART_LIGHT, $user);
    }

    /**
     * Проверка: может ли пользователь управлять СВОИМИ устройствами
     */
    public static function canManageOwn($user = null): bool
    {
        $user = $user ?: Auth::user();
        if (!$user) return false;

        return Gate::check(Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT, $user);
    }

    /**
     * Проверка: может ли пользователь просматривать устройства
     */
    public static function canView($user = null): bool
    {
        $user = $user ?: Auth::user();
        if (!$user) return false;

        return Gate::check(Acl::PERMISSION_VIEW_SMART_LIGHT, $user);
    }

    // ========================================================================
    // 🔍 SCOPE: Фильтрация запросов
    // ========================================================================

    /**
     * Применить фильтрацию по правам к запросу устройств
     *
     * Использование:
     *   SmartLightAuthorization::applyUserScope($query)->get();
     *
     * @param Builder $query
     * @param \App\Models\User|null $user
     * @return Builder
     */
    public static function applyUserScope(Builder $query, $user = null): Builder
    {
        $authUser = $user ?: Auth::user();

        if (!$authUser) {
            return $query->whereRaw('1 = 0');
        }

        // ✅ Админы видят всё
        if (self::canManageAll($authUser)) {
            return $query;
        }

        // ✅ Обычные пользователи — только свои
        if (self::canManageOwn($authUser)) {
            return $query->where('user_id', $authUser->id);
        }

        // ❌ Нет прав — пусто
        return $query->whereRaw('1 = 0');
    }

    /**
     * Явный фильтр: только устройства текущего пользователя
     */
    public static function applyOnlyMyScope(Builder $query, $user = null): Builder
    {
        $authUser = $user ?: Auth::user();
        return $authUser ? $query->where('user_id', $authUser->id) : $query->whereRaw('1 = 0');
    }

    // ========================================================================
    // 📤 УТИЛИТЫ: данные для фронтенда
    // ========================================================================

    /**
     * Получить доступные вкладки для интерфейса
     *
     * @param \App\Models\User|null $user
     * @return array<array{id:string,label:string,icon:string}>
     */
    public static function getTabs($user = null): array
    {
        $authUser = $user ?: Auth::user();
        $tabs = [];

        if (!$authUser) {
            return [['id' => 'personal', 'label' => 'Мои', 'icon' => 'User']];
        }

        // ✅ Проверка прав через сервис
        if (self::canManageAll($authUser)) {
            $tabs[] = ['id' => 'all', 'label' => 'Все', 'icon' => 'Grid'];
        }

        if (self::canView($authUser)) {
            $tabs[] = ['id' => 'real', 'label' => 'Реальные', 'icon' => 'Connection'];
            $tabs[] = ['id' => 'fake', 'label' => 'Фейковые', 'icon' => 'MagicStick'];
        }

        // "Мои" доступно всем авторизованным
        $tabs[] = ['id' => 'personal', 'label' => 'Мои', 'icon' => 'User'];

        return $tabs;
    }

    /**
     * Получить статистику устройств для пользователя
     */
    public static function getStats($user = null): array
    {
        $authUser = $user ?: Auth::user();
        if (!$authUser) {
            return ['total' => 0, 'real' => 0, 'fake' => 0, 'on' => 0, 'sleeping' => 0, 'error' => 0];
        }

        $query = \App\Models\SmartLight\SmartLightDevice::query();

        // Применяем фильтрацию по правам
        if (!self::canManageAll($authUser) && self::canManageOwn($authUser)) {
            $query->where('user_id', $authUser->id);
        } elseif (!self::canManageAll($authUser) && !self::canManageOwn($authUser)) {
            return ['total' => 0, 'real' => 0, 'fake' => 0, 'on' => 0, 'sleeping' => 0, 'error' => 0];
        }

        return [
            'total' => $query->count(),
            'real' => $query->clone()->where('is_fake', false)->count(),
            'fake' => $query->clone()->where('is_fake', true)->count(),
            'on' => $query->clone()->where('status', 'ON')->count(),
            'sleeping' => $query->clone()->where('status', 'SLEEPING')->count(),
            'error' => $query->clone()->where('status', 'ERROR')->count(),
        ];
    }
}
