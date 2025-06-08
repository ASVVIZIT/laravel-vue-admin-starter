<?php
namespace App\Policies;

use App\Models\User;
use App\Models\UserTab;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserTabPolicy
{
    use HandlesAuthorization;

    public function update(User $user, UserTab $userTab)
    {
        return $user->id === $userTab->user_id;
    }
}
