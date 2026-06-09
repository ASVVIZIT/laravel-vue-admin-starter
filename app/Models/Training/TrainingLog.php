<?php

namespace App\Models\Training;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

/**
 * @property int $id
 * @property int $user_id
 * @property int $exercise_id
 * @property \Illuminate\Support\Carbon $date
 * @property string $time
 * @property array $sets
 * @property float $total_volume
 * @property float $total_distance (виртуальный атрибут, в метрах)
 * @property int $total_duration (виртуальный атрибут, в секундах)
 * @property int $total_reps (виртуальный атрибут)
 * @property bool $is_public
 * @property array|null $shared_with
 * @property string|null $notes
 * @property int|null $rating
 */
class TrainingLog extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'user_id', 'exercise_id', 'date', 'time', 'sets',
        'total_volume',
        'is_public', 'shared_with', 'notes', 'rating',
    ];

    protected $casts = [
        'date' => 'date',
        'sets' => 'array',
        'total_volume' => 'decimal:2',
        'is_public' => 'boolean',
        'shared_with' => 'array',
        'rating' => 'integer',
    ];

    // 🔥 Автоматически добавляем эти виртуальные поля в JSON-ответ API
    protected $appends = ['total_distance', 'total_duration', 'total_reps'];

    // ========================================================================
    // АВТО-РАСЧЁТ ПРИ СОХРАНЕНИИ (пуленепробиваемый)
    // ========================================================================
    protected static function boot()
    {
        parent::boot();

        static::saving(function (TrainingLog $log) {
            if (!is_array($log->sets) || empty($log->sets)) {
                $log->total_volume = 0;
                return;
            }

            // Защита от NaN и пустых строк с фронтенда
            $log->total_volume = collect($log->sets)->sum(function ($set) {
                $reps = is_numeric($set['reps'] ?? null) ? (float)$set['reps'] : 0;
                $weight = is_numeric($set['weight'] ?? null) ? (float)$set['weight'] : 0;
                return $reps * $weight;
            });
        });
    }

    // ========================================================================
    // СВЯЗИ
    // ========================================================================
    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ========================================================================
    // SCOPES
    // ========================================================================
    public function scopeMine(Builder $query, ?int $userId = null): Builder
    {
        return $query->where('user_id', $userId ?? Auth::id());
    }

    public function scopeVisibleTo(Builder $query, ?int $viewerId = null): Builder
    {
        $viewerId = $viewerId ?? Auth::id();

        return $query->where(function (Builder $q) use ($viewerId) {
            $q->where('user_id', $viewerId)
                ->orWhere('is_public', true)
                ->orWhereRaw('JSON_CONTAINS(shared_with, ?)', [json_encode($viewerId)]);
        });
    }

    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->where('date', $date);
    }

    public function scopeForDateRange(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('date', [$from, $to]);
    }

    public function scopeForExercise(Builder $query, int $exerciseId): Builder
    {
        return $query->where('exercise_id', $exerciseId);
    }

    public function scopePublicOnly(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    // ========================================================================
    // 🔥 УМНЫЕ АТРИБУТЫ (виртуальные поля из JSON 'sets')
    // ========================================================================

    /**
     * Берётся из колонки БД (быстро!)
     */
    public function getTotalVolumeAttribute(): float
    {
        return (float)($this->attributes['total_volume'] ?? 0);
    }

    /**
     * Сумма повторов по всем подходам
     */
    public function getTotalRepsAttribute(): int
    {
        if (!is_array($this->sets)) return 0;
        return collect($this->sets)->sum(function ($s) {
            return is_numeric($s['reps'] ?? null) ? (int)$s['reps'] : 0;
        });
    }

    /**
     * Сумма дистанции по всем подходам (в метрах)
     */
    public function getTotalDistanceAttribute(): float
    {
        if (!is_array($this->sets)) return 0;
        return collect($this->sets)->sum(function ($s) {
            return is_numeric($s['distance'] ?? null) ? (float)$s['distance'] : 0;
        });
    }

    /**
     * Сумма длительности по всем подходам (в секундах)
     */
    public function getTotalDurationAttribute(): int
    {
        if (!is_array($this->sets)) return 0;
        return (int)collect($this->sets)->sum(function ($s) {
            return is_numeric($s['duration'] ?? null) ? (int)$s['duration'] : 0;
        });
    }

    // ========================================================================
    // ХЕЛПЕРЫ
    // ========================================================================
    public function canBeEditedBy(int $userId): bool
    {
        return $this->user_id === $userId;
    }

    public function isVisibleTo(int $viewerId): bool
    {
        return $this->user_id === $viewerId
            || $this->is_public
            || (is_array($this->shared_with) && in_array($viewerId, $this->shared_with, true));
    }
}
