<?php

namespace App\Models;

use Illuminate\Database\Query\Builder;

/**
 * Class Permission
 *
 * @package App\Models
 */
class Permission extends \Spatie\Permission\Models\Permission
{
    public $guard_name = 'api';

    /**
     * To exclude permission management from the list
     *
     * @param $query
     * @return Builder
     */
    public function scopeAllowed($query)
    {
        return $query->where('name', '!=', \App\Models\Acl::PERMISSION_PERMISSION_MANAGE);
    }
}
