<?php

namespace App\Models\Training;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;

/**
 * Модель тренировочного лога
 *
 * Хранит информацию о выполненной тренировке:
 * - Дата, время, упражнение
 * - Подходы (JSON): reps, weight, duration, distance
 * - Автоматически рассчитывает: total_volume, total_distance, total_duration, total_reps
 * - Поддерживает публикацию и шаринг с другими пользователями
 *
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

    // ========================================================================
    // КОНСТАНТЫ ТИПОВ УПРАЖНЕНИЙ
    // ========================================================================
    public const EXERCISE_BODYWEIGHT = 'bodyweight';
    public const EXERCISE_WEIGHTED = 'weighted';
    public const EXERCISE_CARDIO = 'cardio';
    public const EXERCISE_OTHER = 'other';

    public const EXERCISE_TYPES = [
        self::EXERCISE_BODYWEIGHT,
        self::EXERCISE_WEIGHTED,
        self::EXERCISE_CARDIO,
        self::EXERCISE_OTHER,
    ];

    // ========================================================================
    // КОНСТАНТЫ СТАТУСОВ
    // ========================================================================
    public const RATING_MIN = 1;
    public const RATING_MAX = 5;

    // ========================================================================
    // MASS ASSIGNMENT
    // ========================================================================
    protected $fillable = [
        'user_id',
        'exercise_id',
        'date',
        'time',
        'sets',
        'total_volume',
        'is_public',
        'shared_with',
        'notes',
        'rating',
    ];

    // ========================================================================
    // CASTS
    // ========================================================================
    protected $casts = [
        'date' => 'date',
        'sets' => 'array',
        'total_volume' => 'decimal:2',
        'is_public' => 'boolean',
        'shared_with' => 'array',
        'rating' => 'integer',
    ];

    // ========================================================================
    // APPENDS (виртуальные поля для API)
    // ========================================================================
    protected $appends = [
        'total_distance',
        'total_duration',
        'total_reps',
        'exercise_type',
    ];

    // ========================================================================
    // BOOT — авто-расчёт и нормализация при сохранении
    // ========================================================================
    protected static function boot()
    {
        parent::boot();

        static::saving(function (TrainingLog $log) {
            // Нормализация sets — убираем лишние ключи, приводим типы
            if (is_array($log->sets) && !empty($log->sets)) {
                $log->sets = collect($log->sets)->map(function ($set) {
                    return [
                        'reps' => is_numeric($set['reps'] ?? null) ? (int)$set['reps'] : null,
                        'weight' => is_numeric($set['weight'] ?? null) ? round((float)$set['weight'], 1) : null,
                        'duration' => is_numeric($set['duration'] ?? null) ? (int)$set['duration'] : null,
                        'distance' => is_numeric($set['distance'] ?? null) ? round((float)$set['distance'], 2) : null,
                        'notes' => !empty($set['notes']) ? trim($set['notes']) : null,
                    ];
                })->filter(function ($set) {
                    // Убираем полностью пустые подходы
                    return !is_null($set['reps'])
                        || !is_null($set['weight'])
                        || !is_null($set['duration'])
                        || !is_null($set['distance']);
                })->values()->toArray();
            }

            // Авто-расчёт total_volume
            if (!is_array($log->sets) || empty($log->sets)) {
                $log->total_volume = 0;
            } else {
                $log->total_volume = collect($log->sets)->sum(function ($set) {
                    $reps = (float)($set['reps'] ?? 0);
                    $weight = (float)($set['weight'] ?? 0);
                    return $reps * $weight;
                });
            }

            // Валидация rating
            if (!is_null($log->rating)) {
                $log->rating = max(self::RATING_MIN, min(self::RATING_MAX, (int)$log->rating));
            }
        });
    }

    // ========================================================================
    // СВЯЗИ
    // ========================================================================

    /**
     * Упражнение
     */
    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    /**
     * Пользователь
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ========================================================================
    // SCOPES — базовые
    // ========================================================================

    /**
     * Мои записи
     */
    public function scopeMine(Builder $query, ?int $userId = null): Builder
    {
        return $query->where('user_id', $userId ?? Auth::id());
    }

    /**
     * Видимые для пользователя (мои + публичные + расшаренные мне)
     */
    public function scopeVisibleTo(Builder $query, ?int $viewerId = null): Builder
    {
        $viewerId = $viewerId ?? Auth::id();

        return $query->where(function (Builder $q) use ($viewerId) {
            $q->where('user_id', $viewerId)
                ->orWhere('is_public', true)
                ->orWhereRaw('JSON_CONTAINS(shared_with, ?)', [json_encode($viewerId)]);
        });
    }

    /**
     * Только публичные
     */
    public function scopePublicOnly(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    // ========================================================================
    // SCOPES — по датам
    // ========================================================================

    /**
     * За конкретную дату
     */
    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->where('date', $date);
    }

    /**
     * За период дат
     */
    public function scopeForDateRange(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('date', [$from, $to]);
    }

    /**
     * За конкретный месяц
     */
    public function scopeForMonth(Builder $query, int $year, int $month): Builder
    {
        return $query
            ->whereYear('date', $year)
            ->whereMonth('date', $month);
    }

    /**
     * За конкретную неделю (начиная с $startDate)
     */
    public function scopeForWeek(Builder $query, string $startDate): Builder
    {
        $start = \Carbon\Carbon::parse($startDate)->startOfWeek();
        $end = $start->copy()->endOfWeek();

        return $query->whereBetween('date', [$start, $end]);
    }

    /**
     * За сегодня
     */
    public function scopeForToday(Builder $query): Builder
    {
        return $query->whereDate('date', today());
    }

    /**
     * За последние N дней
     */
    public function scopeForLastDays(Builder $query, int $days): Builder
    {
        return $query->where('date', '>=', now()->subDays($days));
    }

    // ========================================================================
    // SCOPES — по упражнениям
    // ========================================================================

    /**
     * По конкретному упражнению
     */
    public function scopeForExercise(Builder $query, int $exerciseId): Builder
    {
        return $query->where('exercise_id', $exerciseId);
    }

    /**
     * По типу упражнения
     */
    public function scopeForExerciseType(Builder $query, string $type): Builder
    {
        return $query->whereHas('exercise', function ($q) use ($type) {
            $q->where('type', $type);
        });
    }

    /**
     * Только силовые (bodyweight + weighted)
     */
    public function scopeStrengthOnly(Builder $query): Builder
    {
        return $query->whereHas('exercise', function ($q) {
            $q->whereIn('type', [self::EXERCISE_BODYWEIGHT, self::EXERCISE_WEIGHTED]);
        });
    }

    /**
     * Только кардио
     */
    public function scopeCardioOnly(Builder $query): Builder
    {
        return $query->whereHas('exercise', function ($q) {
            $q->where('type', self::EXERCISE_CARDIO);
        });
    }

    // ========================================================================
    // SCOPES — поиск и фильтрация
    // ========================================================================

    /**
     * Поиск по заметкам
     */
    public function scopeWithNotes(Builder $query): Builder
    {
        return $query->whereNotNull('notes')->where('notes', '!=', '');
    }

    /**
     * С оценкой
     */
    public function scopeWithRating(Builder $query): Builder
    {
        return $query->whereNotNull('rating');
    }

    /**
     * С минимальным объёмом
     */
    public function scopeWithMinVolume(Builder $query, float $minVolume): Builder
    {
        return $query->where('total_volume', '>=', $minVolume);
    }

    // ========================================================================
    // ACCESSORS (виртуальные поля)
    // ========================================================================

    /**
     * Общий объём (из колонки БД)
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

    /**
     * Тип упражнения (через связь)
     */
    public function getExerciseTypeAttribute(): ?string
    {
        return $this->exercise?->type;
    }

    /**
     * Длительность в формате MM:SS
     */
    public function getDurationFormattedAttribute(): string
    {
        $seconds = $this->total_duration;
        $minutes = floor($seconds / 60);
        $secs = $seconds % 60;

        return sprintf('%02d:%02d', $minutes, $secs);
    }

    /**
     * Дистанция в километрах
     */
    public function getDistanceKmAttribute(): float
    {
        return round($this->total_distance / 1000, 2);
    }

    // ========================================================================
    // ХЕЛПЕРЫ — проверка типа тренировки
    // ========================================================================

    /**
     * Это кардио-тренировка?
     */
    public function isCardio(): bool
    {
        return $this->exercise?->type === self::EXERCISE_CARDIO;
    }

    /**
     * Это силовая тренировка?
     */
    public function isStrength(): bool
    {
        return in_array($this->exercise?->type, [
            self::EXERCISE_BODYWEIGHT,
            self::EXERCISE_WEIGHTED,
        ]);
    }

    /**
     * Это тренировка с весом?
     */
    public function isWeighted(): bool
    {
        return $this->exercise?->type === self::EXERCISE_WEIGHTED;
    }

    /**
     * Это тренировка с собственным весом?
     */
    public function isBodyweight(): bool
    {
        return $this->exercise?->type === self::EXERCISE_BODYWEIGHT;
    }

    // ========================================================================
    // ХЕЛПЕРЫ — права доступа
    // ========================================================================

    /**
     * Может ли быть отредактирована пользователем?
     */
    public function canBeEditedBy(int $userId): bool
    {
        return $this->user_id === $userId;
    }

    /**
     * Видима ли для пользователя?
     */
    public function isVisibleTo(int $viewerId): bool
    {
        return $this->user_id === $viewerId
            || $this->is_public
            || (is_array($this->shared_with) && in_array($viewerId, $this->shared_with, true));
    }

    // ========================================================================
    // МЕТОДЫ — работа с подходами
    // ========================================================================

    /**
     * Добавить подход
     */
    public function addSet(array $set): self
    {
        $sets = $this->sets ?? [];

        $normalizedSet = [
            'reps' => is_numeric($set['reps'] ?? null) ? (int)$set['reps'] : null,
            'weight' => is_numeric($set['weight'] ?? null) ? round((float)$set['weight'], 1) : null,
            'duration' => is_numeric($set['duration'] ?? null) ? (int)$set['duration'] : null,
            'distance' => is_numeric($set['distance'] ?? null) ? round((float)$set['distance'], 2) : null,
            'notes' => !empty($set['notes']) ? trim($set['notes']) : null,
        ];

        $sets[] = $normalizedSet;
        $this->sets = $sets;
        $this->save();

        return $this;
    }

    /**
     * Удалить подход по индексу
     */
    public function removeSet(int $index): self
    {
        $sets = $this->sets ?? [];

        if (isset($sets[$index])) {
            unset($sets[$index]);
            $this->sets = array_values($sets);
            $this->save();
        }

        return $this;
    }

    /**
     * Обновить подход по индексу
     */
    public function updateSet(int $index, array $newData): self
    {
        $sets = $this->sets ?? [];

        if (isset($sets[$index])) {
            $sets[$index] = array_merge($sets[$index], $newData);
            $this->sets = $sets;
            $this->save();
        }

        return $this;
    }

    /**
     * Получить количество подходов
     */
    public function getSetsCount(): int
    {
        return is_array($this->sets) ? count($this->sets) : 0;
    }

    // ========================================================================
    // МЕТОДЫ — статистика тренировки
    // ========================================================================

    /**
     * Получить статистику тренировки
     */
    public function getStats(): array
    {
        return [
            'sets_count' => $this->getSetsCount(),
            'total_reps' => $this->total_reps,
            'total_volume' => $this->total_volume,
            'total_distance' => $this->total_distance,
            'total_distance_km' => $this->distance_km,
            'total_duration' => $this->total_duration,
            'duration_formatted' => $this->duration_formatted,
            'exercise_type' => $this->exercise_type,
            'is_cardio' => $this->isCardio(),
            'is_strength' => $this->isStrength(),
        ];
    }

    /**
     * Рассчитать интенсивность (объём / время)
     */
    public function getIntensity(): float
    {
        if ($this->total_duration === 0) {
            return 0;
        }

        return round($this->total_volume / ($this->total_duration / 60), 2);
    }

    /**
     * Средний вес за тренировку
     */
    public function getAverageWeight(): float
    {
        if (!is_array($this->sets)) return 0;

        $weights = collect($this->sets)
            ->pluck('weight')
            ->filter(fn($w) => !is_null($w) && $w > 0);

        return $weights->isEmpty() ? 0 : round($weights->avg(), 1);
    }

    /**
     * Максимальный вес за тренировку
     */
    public function getMaxWeight(): float
    {
        if (!is_array($this->sets)) return 0;

        $weights = collect($this->sets)
            ->pluck('weight')
            ->filter(fn($w) => !is_null($w));

        return $weights->isEmpty() ? 0 : (float)$weights->max();
    }

    // ========================================================================
    // МЕТОДЫ — публикация и шаринг
    // ========================================================================

    /**
     * Опубликовать
     */
    public function publish(): self
    {
        $this->update(['is_public' => true]);
        return $this;
    }

    /**
     * Снять с публикации
     */
    public function unpublish(): self
    {
        $this->update(['is_public' => false]);
        return $this;
    }

    /**
     * Поделиться с пользователями
     */
    public function shareWith(array $userIds): self
    {
        $this->update(['shared_with' => array_unique($userIds)]);
        return $this;
    }

    /**
     * Убрать доступ у пользователей
     */
    public function unshareFrom(array $userIds): self
    {
        $current = $this->shared_with ?? [];
        $updated = array_diff($current, $userIds);

        $this->update(['shared_with' => empty($updated) ? null : array_values($updated)]);
        return $this;
    }

    /**
     * Поделиться с пользователем
     */
    public function shareWithUser(int $userId): self
    {
        $current = $this->shared_with ?? [];

        if (!in_array($userId, $current)) {
            $current[] = $userId;
            $this->update(['shared_with' => $current]);
        }

        return $this;
    }

    // ========================================================================
    // МЕТОДЫ — форматирование для API
    // ========================================================================

    /**
     * Данные для API (публичные)
     */
    public function getPublicData(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'exercise' => $this->exercise?->only(['id', 'name', 'type']),
            'date' => $this->date->format('Y-m-d'),
            'time' => $this->time,
            'sets' => $this->sets,
            'total_volume' => $this->total_volume,
            'total_reps' => $this->total_reps,
            'total_distance' => $this->total_distance,
            'total_duration' => $this->total_duration,
            'duration_formatted' => $this->duration_formatted,
            'is_public' => $this->is_public,
            'notes' => $this->notes,
            'rating' => $this->rating,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Данные для админки (полные)
     */
    public function getAdminData(): array
    {
        return array_merge($this->getPublicData(), [
            'shared_with' => $this->shared_with,
            'exercise_type' => $this->exercise_type,
            'stats' => $this->getStats(),
            'intensity' => $this->getIntensity(),
            'average_weight' => $this->getAverageWeight(),
            'max_weight' => $this->getMaxWeight(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ]);
    }
}
