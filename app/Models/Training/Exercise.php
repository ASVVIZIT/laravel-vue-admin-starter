<?php

namespace App\Models\Training;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property string $type
 * @property string $default_unit
 * @property bool $is_active
 */
class Exercise extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = ['name', 'type', 'default_unit', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
    protected $dates = ['deleted_at'];

    public function logs(): HasMany
    {
        return $this->hasMany(TrainingLog::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where('name', 'LIKE', "%{$term}%");
    }
}
