<?php

namespace App\Models;

use Illuminate\Support\Facades\Storage;
use App\Models\TalkStream\FriendRequest;
use Carbon\Carbon;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles, Filterable;

    protected $guard_name = 'api';

    const SEX_MAP = [
        0 => 'Male',
        1 => 'Female'
    ];

    protected $dates = ['deleted_at', 'birthday'];
    protected $fillable = [
        'name', 'email', 'password', 'status', 'sex', 'birthday', 'description', 'avatar'
    ];

    public $appends = ['age', 'sex_format', 'main_role'];

    protected $hidden = [
        'password',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function userTabs()
    {
        return $this->hasMany(UserTab::class);
    }

    public function getMainRoleAttribute()
    {
        return $this->roles->first()?->name ?? 'Гость';
    }

    public function getAvatarAttribute($value)
    {
        // Если аватарка указана и существует
        if (!empty($value) && Storage::disk('public')->exists($value)) {
            return $value;
        }

        // Иначе — определяем дефолтную аватарку по полу
        $defaultAvatar = self::SEX_MAP[$this->sex] === 'Male'
            ? config('content.default_avatar_male')
            : config('content.default_avatar_female');

        return $defaultAvatar;
    }

    public function getSexFormatAttribute()
    {
        return self::SEX_MAP[$this->sex];
    }

    public function getAgeAttribute()
    {
        if (empty($this->birthday)) {
            return 'Дата рождения не указана';
        }
        return Carbon::now()->diffInYears($this->birthday);
    }

    public function hasPermission($permission): bool
    {
        foreach ($this->roles as $role) {
            if (in_array($permission, $role->permissions->pluck('name')->toArray())) {
                return true;
            }
        }
        return false;
    }

    public function isAdmin(): bool
    {
        foreach ($this->roles as $role) {
            if ($role->isAdmin()) {
                return true;
            }
        }
        return false;
    }

    public function friendRequestsSent()
    {
        return $this->hasMany(FriendRequest::class, 'user_id');
    }

    public function friendRequestsReceived()
    {
        return $this->hasMany(FriendRequest::class, 'friend_id');
    }

    // Друзья пользователя
    public function friends()
    {
        return $this->belongsToMany(
            User::class,
            'friend_requests',
            'user_id',
            'friend_id'
        )->wherePivot('accepted', true);
    }

    public function getAuthIdentifier()
    {
        return $this->getKey();
    }
}
