<?php

namespace App\Models;

use Spatie\Permission\Models\Permission;

/**
 * Class Role
 *
 * @property Permission[] $permissions
 * @property string $name
 * @package App\Models
 */
class Role extends \Spatie\Permission\Models\Role
{
    public $guard_name = 'web';

    /**
     * Check whether current role is admin
     * @return bool
     */
    public function isAdmin(): bool
    {
        return in_array($this->name, [\App\Models\Acl::ROLE_SUPER_ADMIN, \App\Models\Acl::ROLE_ADMIN]);
    }

    /**
     * Check the role type
     * @return string|null
     */
    public function getRoleType(): ?string
    {
        switch ($this->name) {
            case \App\Models\Acl::ROLE_SUPER_ADMIN:
                return 'super_admin';
            case \App\Models\Acl::ROLE_ADMIN:
                return 'admin';
            case \App\Models\Acl::ROLE_MANAGER:
                return 'manager';
            case \App\Models\Acl::ROLE_EDITOR:
                return 'editor';
            case \App\Models\Acl::ROLE_USER:
                return 'user';
            case \App\Models\Acl::ROLE_VISITOR:
                return 'visitor';
            default:
                return null;
        }
    }
}
