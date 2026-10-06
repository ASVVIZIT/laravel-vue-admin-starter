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

/**
 * Учётная запись пользователя.
 *
 * Хранит профиль, состояние подтверждения email, процесс смены email,
 * признаки системной (тестовой) учётки и связи с ролями/друзьями.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    // HasApiTokens   — выдача Sanctum-токенов для API-аутентификации.
    // HasFactory     — генерация тестовых/сидовых записей.
    // Notifiable     — отправка уведомлений (в т.ч. письмо подтверждения email).
    // SoftDeletes    — «мягкое» удаление через deleted_at.
    // HasRoles       — роли и права Spatie.
    // Filterable     — поддержка EloquentFilter-скоупов для списков.
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles, Filterable;

    // Guard, через который модель проходит аутентификацию (web-сессии + Sanctum поверх).
    public $guard_name = 'web';

    // Код пола в БД -> человекочитаемое значение для аксессоров.
    const SEX_MAP = [
        0 => 'Male',
        1 => 'Female'
    ];

    // Поля, разрешённые для массового присвоения (create/update/fill).
    protected $fillable = [
        'name',                      // Отображаемое имя пользователя.
        'email',                     // Уникальный логин, хранится в нижнем регистре.
        'password',                  // bcrypt-хэш пароля.
        'status',                    // Служебный статус записи (если используется бизнес-логикой).
        'sex',                       // Пол: 0 = Male, 1 = Female (см. SEX_MAP).
        'birthday',                  // Дата рождения, кастится в Carbon.
        'description',               // Короткая биография / о себе.
        'avatar',                    // Путь к файлу на диске public; при отсутствии подставляется дефолт по полу.
        'email_verified_at',         // Момент первичного подтверждения email при регистрации.
        'pending_new_email',         // Новый email, ожидающий двустороннего подтверждения при смене.
        'pending_email_token',       // Одноразовый токен ссылки подтверждения смены email.
        'pending_email_expires_at',  // Срок жизни токена смены email.
        'old_email_confirmed',       // Признак подтверждения старого email в процессе смены.
        'old_email_confirm_method',  // Способ подтверждения старого email: 'email' | 'admin' | null.
        'new_email_confirm_method',  // Способ подтверждения нового email: 'email' | 'admin' | null.
        'remember_token',            // Токен автоматического входа (cookies).
        'is_system',                 // Признак системной (тестовой) учётки.
        'system_role',               // Внутренняя роль системной учётки.
    ];

    // Виртуальные поля, добавляемые в сериализацию модели из аксессоров ниже.
    public $appends = ['age', 'sex_format', 'main_role'];

    // Поля, исключаемые из сериализации модели (secret / служебное).
    protected $hidden = [
        'password',                  // Хэш пароля не отдаётся наружу.
        'updated_at'                 // Момент последнего изменения не нужен в ответах.
    ];

    // Приведение типов столбцов к PHP-значениям при чтении/записи атрибута.
    protected $casts = [
        'email_verified_at'        => 'datetime', // Carbon: дата первичного подтверждения.
        'email_reverified_at'      => 'datetime', // Carbon: дата повторного подтверждения (re-verification); read-only, пишется вне массового присвоения.
        'deleted_at'               => 'datetime', // Carbon: момент soft-delete (управляется SoftDeletes).
        'birthday'                 => 'datetime', // Carbon: дата рождения.
        'pending_email_expires_at' => 'datetime', // Carbon: дедлайн токена смены email.
        'old_email_confirmed'      => 'boolean',  // bool: подтверждён ли старый email.
        'is_system'                => 'boolean',  // bool: системная ли учётка.
    ];

    /**
     * Вкладки пользователя (пользовательские настройки интерфейса).
     */
    public function userTabs()
    {
        return $this->hasMany(UserTab::class);
    }

    /**
     * Аксессор appends main_role: первая роль пользователя либо 'Гость'.
     */
    public function getMainRoleAttribute()
    {
        return $this->roles->first()?->name ?? 'Гость';
    }

    /**
     * Аксессор столбца avatar: возвращает путь к файлу, если он существует
     * на диске public, иначе дефолтное изображение по полу пользователя.
     *
     * @param  string|null  $value  Сырое значение столбца avatar.
     */
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

    /**
     * Аксессор appends sex_format: человекочитаемое значение пола
     * ('Male' / 'Female' / 'Не указан').
     */
    public function getSexFormatAttribute()
    {
        $sex = $this->sex;
        if ($sex === null || $sex === '') {
            return 'Не указан';
        }
        return self::SEX_MAP[$sex] ?? 'Не указан';
    }

    /**
     * Аксессор appends age: возраст в годах либо текст-заглушка,
     * если дата рождения не указана.
     */
    public function getAgeAttribute()
    {
        if (empty($this->birthday)) {
            return 'Дата рождения не указана';
        }
        return Carbon::now()->diffInYears($this->birthday);
    }

    /**
     * Наличие права среди всех ролей пользователя.
     *
     * @param  string  $permission  Имя права.
     */
    public function hasPermission($permission): bool
    {
        foreach ($this->roles as $role) {
            if (in_array($permission, $role->permissions->pluck('name')->toArray())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Есть ли у пользователя роль с флагом администратора.
     */
    public function isAdmin(): bool
    {
        foreach ($this->roles as $role) {
            if ($role->isAdmin()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Является ли пользователь суперадминистратором (роль Acl::ROLE_SUPER_ADMIN).
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(\App\Models\Acl::ROLE_SUPER_ADMIN);
    }

    /**
     * Исходящие заявки в друзья (пользователь — отправитель).
     */
    public function friendRequestsSent()
    {
        return $this->hasMany(FriendRequest::class, 'user_id');
    }

    /**
     * Входящие заявки в друзья (пользователь — получатель).
     */
    public function friendRequestsReceived()
    {
        return $this->hasMany(FriendRequest::class, 'friend_id');
    }

    /**
     * Принятые друзья: связь many-to-many через friend_requests
     * с условием accepted = true в pivot.
     */
    public function friends()
    {
        return $this->belongsToMany(
            User::class,
            'friend_requests',
            'user_id',
            'friend_id'
        )->wherePivot('accepted', true);
    }

    /**
     * Идентификатор учётки для guard (первичный ключ модели).
     */
    public function getAuthIdentifier()
    {
        return $this->getKey();
    }

    // Системные (тестовые) учётки.

    /**
     * Признак системной (тестовой) учётки.
     */
    public function isSystem(): bool
    {
        return (bool) $this->is_system;
    }

    /**
     * Скоуп: только системные (тестовые) пользователи.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Скоуп: только реальные (не системные) пользователи.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     */
    public function scopeReal($query)
    {
        return $query->where('is_system', false);
    }
}
