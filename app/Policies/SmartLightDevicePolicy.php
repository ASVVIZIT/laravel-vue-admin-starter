<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Auth\Access\Response;
use App\Models\Acl;

class SmartLightDevicePolicy
{
    /**
     * Определить, может ли пользователь просматривать любой ресурс.
     */
    public function viewAny(User $user): bool
    {
        return $user->can(Acl::PERMISSION_VIEW_SMART_LIGHT) ||
            $user->can(Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT);
    }

    /**
     * Определить, может ли пользователь просматривать указанный ресурс.
     */
    public function view(User $user, SmartLightDevice $device): bool
    {
        return $user->can(Acl::PERMISSION_MANAGE_SMART_LIGHT) ||
            $device->user_id === $user->id;
    }

    /**
     * Определить, может ли пользователь создавать ресурсы.
     */
    public function create(User $user): bool
    {
        return $user->can(Acl::PERMISSION_MANAGE_SMART_LIGHT) ||
            $user->can(Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT);
    }

    /**
     * Определить, может ли пользователь обновлять указанный ресурс.
     */
    public function update(User $user, SmartLightDevice $device): bool
    {
        if ($user->can(Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            return true;
        }

        return $user->can(Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT) &&
            $device->user_id === $user->id;
    }

    /**
     * Определить, может ли пользователь удалять указанный ресурс.
     */
    public function delete(User $user, SmartLightDevice $device): bool
    {
        if ($user->can(Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            return true;
        }

        return $user->can(Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT) &&
            $device->user_id === $user->id;
    }

    /**
     * Определить, может ли пользователь восстанавливать указанный ресурс.
     */
    public function restore(User $user, SmartLightDevice $device): bool
    {
        return $this->delete($user, $device);
    }

    /**
     * Определить, может ли пользователь навсегда удалять указанный ресурс.
     */
    public function forceDelete(User $user, SmartLightDevice $device): bool
    {
        return $user->can(Acl::PERMISSION_MANAGE_SMART_LIGHT);
    }

    /**
     * Определить, может ли пользователь отправлять команды спящего режима.
     */
    public function forceSleep(User $user, SmartLightDevice $device): bool
    {
        return $this->update($user, $device);
    }
}
