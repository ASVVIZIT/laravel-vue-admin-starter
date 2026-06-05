<?php

namespace App\Services\Training;

use App\Models\Training\TrainingSetting;
use App\Models\Training\TrainingLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TrainingSettingsService
{
    private const CACHE_KEY = 'training_settings_all';
    private const CACHE_TTL = 3600;
    private const TABS = ['mine', 'shared-with-me', 'shared-by-me'];

    private const DEFAULT_COLUMNS = [
        'mine' => ['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true],
        'shared-with-me' => ['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => false],
        'shared-by-me' => ['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true],
    ];

    private function getAllSettings(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return TrainingSetting::pluck('value', 'key')->toArray();
        });
    }

    public function getAllGrouped(): array
    {
        $all = $this->getAllSettings();
        return [
            'server' => $this->filterByPrefix($all, 'server.'),
            'frontend' => $this->filterByPrefix($all, 'frontend.'),
        ];
    }

    public function get(string $key, $default = null)
    {
        $all = $this->getAllSettings();
        return isset($all[$key]) ? $all[$key] : $default;
    }

    public function getTyped(string $key, $default = null)
    {
        $value = $this->get($key);
        if ($value === null) return $default;

        $lowerValue = strtolower((string)$value);
        if (in_array($lowerValue, ['true', 'false', '1', '0'], true)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }
        if (is_numeric($value)) {
            return strpos((string)$value, '.') !== false ? (float)$value : (int)$value;
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }
        return $value;
    }

    public function set(string $key, $value): void
    {
        $dbValue = $value;
        if (is_bool($value)) $dbValue = $value ? 'true' : 'false';
        elseif (is_array($value)) $dbValue = json_encode($value);
        elseif (is_numeric($value)) $dbValue = (string)$value;

        TrainingSetting::updateOrCreate(['key' => $key], ['value' => $dbValue]);
        Cache::forget(self::CACHE_KEY);
    }

    public function getColumnsConfig(): array
    {
        $config = [];
        foreach (self::TABS as $tab) {
            $key = "frontend.columns.{$tab}";
            $value = $this->getTyped($key);
            $config[$tab] = is_array($value) ? $value : self::DEFAULT_COLUMNS[$tab];
        }
        return $config;
    }

    public function resolveGroupingMode(int $userId, string $tab): array
    {
        $mode = $this->getTyped('server.grouping_mode', 'auto');
        $threshold = $this->getTyped('server.grouping_auto_threshold', 500);
        $groupBy = $this->getTyped('server.grouping_by', 'user');

        $enableMinCheck = $this->getTyped('server.enable_min_groups_check', true);
        $minGroups = $this->getTyped('server.grouping_min_groups', 3);

        if ($mode !== 'auto') {
            return ['mode' => $mode, 'server_by' => $groupBy, 'reason' => "Ручной режим: {$mode}"];
        }

        $totalCount = $this->countLogsForTab($userId, $tab);

        if ($totalCount < $threshold) {
            return [
                'mode' => 'frontend',
                'count' => $totalCount,
                'threshold' => $threshold,
                'reason' => "Мало записей: {$totalCount} < {$threshold}"
            ];
        }

        if ($enableMinCheck) {
            $uniqueGroups = $this->countUniqueGroupsForTab($userId, $tab, $groupBy);

            if ($uniqueGroups < $minGroups) {
                return [
                    'mode' => 'frontend',
                    'count' => $totalCount,
                    'unique_groups' => $uniqueGroups,
                    'min_groups' => $minGroups,
                    'reason' => "Мало уникальных групп: {$uniqueGroups} < {$minGroups}"
                ];
            }

            return [
                'mode' => 'server',
                'server_by' => $groupBy,
                'count' => $totalCount,
                'unique_groups' => $uniqueGroups,
                'min_groups' => $minGroups,
                'reason' => "Достаточно групп: {$uniqueGroups} >= {$minGroups}"
            ];
        }

        return [
            'mode' => 'server',
            'server_by' => $groupBy,
            'count' => $totalCount,
            'reason' => "Авто по порогу записей: {$totalCount} >= {$threshold}"
        ];
    }

    private function countUniqueGroupsForTab(int $userId, string $tab, string $groupBy): int
    {
        $query = TrainingLog::query();

        if ($tab === 'mine') {
            $query->where('user_id', $userId);
        } elseif ($tab === 'shared-with-me') {
            $query->where('user_id', '!=', $userId)
                ->where(function ($q) use ($userId) {
                    $q->where('is_public', true)
                        ->orWhereRaw('JSON_CONTAINS(shared_with, CAST(? AS JSON))', [json_encode($userId)]);
                });
        } elseif ($tab === 'shared-by-me') {
            $query->where('user_id', $userId)
                ->where(function ($q) {
                    $q->where('is_public', true)
                        ->orWhereRaw('JSON_LENGTH(shared_with) > 0');
                });
        }

        if ($groupBy === 'user') {
            $column = 'user_id';
        } elseif ($groupBy === 'exercise') {
            $column = 'exercise_id';
        } else {
            $column = DB::raw("DATE_FORMAT(date, '%Y-%m')");
        }

        return $query->distinct()->count($column);
    }

    private function countLogsForTab(int $userId, string $tab): int
    {
        if ($tab === 'shared-with-me') {
            return TrainingLog::where('user_id', '!=', $userId)
                ->where(function ($q) use ($userId) {
                    $q->where('is_public', true)
                        ->orWhereRaw('JSON_CONTAINS(shared_with, CAST(? AS JSON))', [json_encode($userId)]);
                })->count();
        }
        if ($tab === 'shared-by-me') {
            return TrainingLog::where('user_id', $userId)
                ->where(function ($q) {
                    $q->where('is_public', true)
                        ->orWhereRaw('JSON_LENGTH(shared_with) > 0');
                })->count();
        }
        return TrainingLog::where('user_id', $userId)->count();
    }

    private function filterByPrefix(array $settings, string $prefix): array
    {
        $result = [];
        $prefixLen = strlen($prefix);
        foreach ($settings as $key => $value) {
            if (strpos($key, $prefix) === 0) {
                $result[substr($key, $prefixLen)] = $this->getTyped($key);
            }
        }
        return $result;
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
