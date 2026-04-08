<?php

namespace App\Models\SmartLight;

use App\Models\User;
use App\Services\SmartLight\SmartLightAuthorization;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ============================================================================
 * SMARTLIGHT USER — Обёртка для отношений (без изменения базового User)
 * ============================================================================
 * 📁 Путь: app/Models/SmartLight/SmartLightUser.php
 * ✅ Назначение: Только отношения + делегирование прав в сервис
 * ✅ Базовый User не меняется — чистая архитектура
 * ============================================================================
 */

class SmartLightUser extends User
{
    // ========================================================================
    // 🔗 ОТНОШЕНИЯ (только для SmartLight)
    // ========================================================================

    public function smartLightDevices(): HasMany
    {
        return $this->hasMany(SmartLightDevice::class, 'user_id', 'id');
    }

    public function realSmartLightDevices(): HasMany
    {
        return $this->smartLightDevices()->where('is_fake', false);
    }

    public function fakeSmartLightDevices(): HasMany
    {
        return $this->smartLightDevices()->where('is_fake', true);
    }

    // ========================================================================
    // 📤 УТИЛИТЫ (делегирование в сервис)
    // ========================================================================

    /**
     * Получить вкладки — делегируем в сервис
     */
    public function getSmartLightTabs(): array
    {
        return SmartLightAuthorization::getTabs($this);
    }

    /**
     * Получить статистику — делегируем в сервис
     */
    public function getSmartLightStats(): array
    {
        return SmartLightAuthorization::getStats($this);
    }

    /**
     * Получить текущего пользователя
     */
    public static function current(): ?self
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        if (!$user) return null;

        // Возвращаем обёртку, но права проверяются через сервис
        return $user instanceof self ? $user : new self((array) $user->getAttributes());
    }

    // ========================================================================
    // 🔐 ПРАВА (делегирование в сервис — без изменения базового User)
    // ========================================================================

    public function canManageAllSmartLights(): bool
    {
        return SmartLightAuthorization::canManageAll($this);
    }

    public function canManageOwnSmartLights(): bool
    {
        return SmartLightAuthorization::canManageOwn($this);
    }

    public function canViewSmartLights(): bool
    {
        return SmartLightAuthorization::canView($this);
    }
}
