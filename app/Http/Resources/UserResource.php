<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Acl;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        // Получаем коллекции прав для расчетов
        $rolePerms = $this->getPermissionsViaRoles();
        $directPerms = $this->getDirectPermissions();
        $allPermsList = Acl::permissions();

        // Хелперы для проверки типа права (строго соответствуют логике во фронтенде)
        $isView = fn($name) => str_starts_with($name, 'view ');
        $isManage = fn($name) => str_starts_with($name, 'manage ') || in_array($name, ['share training', 'create training log']);

        // 1. Подсчёт прав, унаследованных от роли
        $roleViewCount = $rolePerms->filter(fn($p) => $isView($p['name']))->count();
        $roleManageCount = $rolePerms->filter(fn($p) => $isManage($p['name']))->count();

        // 2. Подсчёт прямых (персональных) прав пользователя
        $userViewCount = $directPerms->filter(fn($p) => $isView($p['name']))->count();
        $userManageCount = $directPerms->filter(fn($p) => $isManage($p['name']))->count();

        // 3. Общее количество прав в системе по категориям (для расчета "доступно для добавления")
        $totalViewAll = collect($allPermsList)->filter($isView)->count();
        $totalManageAll = collect($allPermsList)->filter($isManage)->count();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'avatar' => $this->avatar,
            'sex' => $this->sex,
            'sex_format' => $this->sex_format,
            'age' => $this->age,
            'birthday' => $this->birthday,
            'description' => $this->description,

            // ПОЛЯ СТАТУСА
            'status_type' => $this->getStatusType(),
            'is_banned' => $this->isBanned(),
            'email_verified' => $this->hasVerifiedEmail(),
            'email_reverified_at' => $this->email_reverified_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'banned_at' => $this->bannedAt(),

            // АДМИН ПОДТВЕРЖДЕНИЕ ЕМАЙЛ БЕЗ ДОСТУПА К ПОЧТЕ ПО КНОПКЕ
            'has_pending_email_change' => !empty($this->pending_new_email),
            'pending_new_email' => $this->pending_new_email,
            'old_email_confirmed' => (bool) $this->old_email_confirmed,

            'roles' => $this->roles->pluck('name')->toArray(),
            'permissions' => $this->getAllPermissions()->pluck('name')->toArray(),

            // Детализированные счётчики прав для компактных тегов в таблице
            'perm_counts' => [
                'role_view' => $roleViewCount,
                'role_manage' => $roleManageCount,
                'user_view' => $userViewCount,
                'total_user_view' => max(0, $totalViewAll - $roleViewCount), // Сколько всего view прав минус те, что уже дала роль
                'user_manage' => $userManageCount,
                'total_user_manage' => max(0, $totalManageAll - $roleManageCount), // Сколько всего manage прав минус те, что уже дала роль
            ],

            // Оставляем старые счетчики для обратной совместимости (если вдруг используются в других местах)
            'permissions_count' => $this->getAllPermissions()->count(),
            'role_permissions_count' => $roleViewCount + $roleManageCount,
            'direct_permissions_count' => $userViewCount + $userManageCount,
        ];
    }

    private function getStatusType(): string
    {
        if ($this->trashed()) {
            return 'trashed';
        }

        if ($this->isBanned()) {
            return 'banned';
        }

        if (!$this->hasVerifiedEmail()) {
            return 'unverified';
        }

        return 'active';
    }

    private function isBanned(): bool
    {
        // ищем по email, а не по ip_address
        return \App\Models\LoginAttempt::where('email', $this->email)
            ->where('is_banned', true)
            ->exists();
    }

    private function bannedAt(): ?string
    {
        // ищем по email, а не по ip_address
        $attempt = \App\Models\LoginAttempt::where('email', $this->email)
            ->where('is_banned', true)
            ->first();

        return $attempt?->updated_at?->toISOString();
    }
}
