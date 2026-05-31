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
        'is_public', 'shared_with', 'notes', 'rating',
    ];

    protected $casts = [
        'date' => 'date',
        'sets' => 'array',
        'is_public' => 'boolean',
        'shared_with' => 'array',
        'rating' => 'integer',
    ];

    // Связи
    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
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
                // ✅ Исправлено: безопасный JSON-поиск без индекса
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

    // Атрибуты-вычисления
    public function getTotalRepsAttribute(): int
    {
        if (!is_array($this->sets)) return 0;
        return array_sum(array_map(fn($s) => (int)($s['reps'] ?? 0), $this->sets));
    }

    public function getTotalVolumeAttribute(): float
    {
        if (!is_array($this->sets)) return 0.0;
        return array_sum(array_map(fn($s) =>
            (int)($s['reps'] ?? 0) * (float)($s['weight'] ?? 0), $this->sets));
    }

    public function getTotalDurationAttribute(): int
    {
        if (!is_array($this->sets)) return 0;
        $seconds = array_sum(array_map(fn($s) => (int)($s['duration'] ?? 0), $this->sets));
        return (int) round($seconds / 60);
    }

    // Хелперы
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
