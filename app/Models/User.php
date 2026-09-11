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

    public $guard_name = 'web';

    const SEX_MAP = [
        0 => 'Male',
        1 => 'Female'
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'sex',
        'birthday',
        'description',
        'avatar',
        'email_verified_at',
        'pending_new_email',
        'pending_email_token',
        'pending_email_expires_at',
        'old_email_confirmed',
        'old_email_confirm_method',
        'new_email_confirm_method',
        'is_system',
        'system_role',
    ];

    public $appends = ['age', 'sex_format', 'main_role'];

    protected $hidden = [
        'password',
        'updated_at'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'deleted_at' => 'datetime',
        'birthday' => 'datetime',
        // Кастинг для полей смены email
        'pending_email_expires_at' => 'datetime',
        'old_email_confirmed' => 'boolean',
        'is_system' => 'boolean',
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
        if (!empty($value) && Storage::disk('public')->exists($value)) {
            return $value;
        }

        $sex = $this->sex ?? 0;
        $sexLabel = self::SEX_MAP[$sex] ?? 'Male';

        $defaultAvatar = $sexLabel === 'Male'
            ? config('content.default_avatar_male')
            : config('content.default_avatar_female');

        return $defaultAvatar;
    }

    public function getSexFormatAttribute()
    {
        $sex = $this->sex;
        if ($sex === null || $sex === '') {
            return 'Не указан';
        }
        return self::SEX_MAP[$sex] ?? 'Не указан';
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

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(\App\Models\Acl::ROLE_SUPER_ADMIN);
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

    // ========================================================================
    // 🔥 B3: Методы для системных (тестовых) пользователей
    // ========================================================================

    /**
     * Является ли пользователь системным (тестовым).
     */
    public function isSystem(): bool
    {
        return (bool) $this->is_system;
    }

    /**
     * Scope: только системные пользователи.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope: только реальные (не системные) пользователи.
     */
    public function scopeReal($query)
    {
        return $query->where('is_system', false);
    }
}
