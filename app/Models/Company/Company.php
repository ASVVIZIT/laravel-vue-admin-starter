<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'address',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Получить все каналы связи компании
     */
    public function contactChannels(): HasMany
    {
        return $this->hasMany(CompanyContactChannel::class, 'company_id');
    }

    /**
     * Получить только активные каналы
     */
    public function activeContactChannels(): HasMany
    {
        return $this->contactChannels()->where('is_active', true);
    }

    /**
     * Получить каналы по типу
     */
    public function contactChannelsByType(string $type): HasMany
    {
        return $this->contactChannels()->where('type', $type);
    }
}
