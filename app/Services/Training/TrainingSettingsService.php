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

    // 🔥 ЕДИНСТВЕННОЕ МЕСТО ДЛЯ КОНСТАНТ
    private const DEFAULT_COLUMNS = [
        'mine' => ['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true],
        'shared-with-me' => ['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => false],
        'shared-by-me' => ['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true],
    ];

    private const DEFAULT_LIMITS = [
        'max_shared_with'      => 100,
        'search_results_limit' => 100,
        'max_sets'             => 50,
        'max_notes_length'     => 1000,
        'search_min_length'    => 2,
    ];

    private function getAllSettings(): array {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, fn() => TrainingSetting::pluck('value', 'key')->toArray());
    }

    public function getAllGrouped(): array {
        $all = $this->getAllSettings();
        return [
            'server'   => $this->filterByPrefixNested($all, 'server.'),
            'frontend' => $this->filterByPrefixNested($all, 'frontend.'),
        ];
    }

    public function get(string $key, $default = null) {
        return $this->getAllSettings()[$key] ?? $default;
    }

    public function getTyped(string $key, $default = null) {
        $value = $this->get($key);
        if ($value === null) return $default;
        $lower = strtolower((string)$value);
        if (in_array($lower, ['true', 'false', '1', '0'], true)) return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        if (is_numeric($value)) return strpos((string)$value, '.') !== false ? (float)$value : (int)$value;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) return $decoded;
        }
        return $value;
    }

    public function setMany(array $settings): void {
        DB::transaction(function () use ($settings) {
            foreach ($settings as $key => $value) {
                $dbValue = is_bool($value) ? ($value ? 'true' : 'false')
                    : (is_array($value) ? json_encode($value) : (string)$value);
                TrainingSetting::updateOrCreate(['key' => $key], ['value' => $dbValue]);
            }
        });
        Cache::forget(self::CACHE_KEY);
    }

    // 🔥 Ключ frontend.columns.{$tab} (консистентность префиксов)
    public function getColumnsConfig(): array {
        $config = [];
        foreach (self::TABS as $tab) {
            $key = "frontend.columns.{$tab}";
            $value = $this->getTyped($key);
            $config[$tab] = is_array($value) ? $value : self::DEFAULT_COLUMNS[$tab];
        }
        return $config;
    }

    public function getLimits(): array {
        $limits = self::DEFAULT_LIMITS;
        foreach ($limits as $key => $default) {
            $stored = $this->getTyped("limits.{$key}");
            if ($stored !== null && is_numeric($stored)) $limits[$key] = (int) $stored;
        }
        return $limits;
    }

    public function getLimit(string $key): int {
        return $this->getLimits()[$key] ?? 0;
    }

    public function resolveGroupingMode(int $userId, string $tab): array {
        $mode = $this->getTyped('server.grouping_mode', 'auto');
        $threshold = $this->getTyped('server.grouping_auto_threshold', 500);
        $groupBy = $this->getTyped('server.grouping_by', 'user');
        $enableMinCheck = $this->getTyped('server.enable_min_groups_check', true);
        $minGroups = $this->getTyped('server.grouping_min_groups', 3);

        if ($mode !== 'auto') return ['mode' => $mode, 'server_by' => $groupBy, 'reason' => "Ручной режим: {$mode}"];

        $count = $this->countLogsForTab($userId, $tab);
        if ($count < $threshold) return ['mode' => 'frontend', 'count' => $count, 'threshold' => $threshold, 'reason' => "Мало записей: {$count} < {$threshold}"];

        if ($enableMinCheck) {
            $unique = $this->countUniqueGroupsForTab($userId, $tab, $groupBy);
            if ($unique < $minGroups) return ['mode' => 'frontend', 'count' => $count, 'unique_groups' => $unique, 'min_groups' => $minGroups, 'reason' => "Мало групп: {$unique} < {$minGroups}"];
            return ['mode' => 'server', 'server_by' => $groupBy, 'count' => $count, 'unique_groups' => $unique, 'min_groups' => $minGroups, 'reason' => "Достаточно групп: {$unique} >= {$minGroups}"];
        }
        return ['mode' => 'server', 'server_by' => $groupBy, 'count' => $count, 'reason' => "Авто по порогу: {$count} >= {$threshold}"];
    }

    private function filterByPrefixNested(array $settings, string $prefix): array {
        $flat = $this->filterByPrefix($settings, $prefix);
        $result = [];
        foreach ($flat as $key => $value) {
            $parts = explode('.', $key);
            if (count($parts) === 1) $result[$parts[0]] = $value;
            else $this->setNestedValue($result, $parts, $value);
        }
        return $result;
    }

    private function setNestedValue(array &$array, array $keys, $value): void {
        $current = &$array;
        foreach ($keys as $i => $key) {
            if ($i === count($keys) - 1) $current[$key] = $value;
            else {
                if (!isset($current[$key]) || !is_array($current[$key])) $current[$key] = [];
                $current = &$current[$key];
            }
        }
    }

    private function countUniqueGroupsForTab(int $userId, string $tab, string $groupBy): int {
        $query = TrainingLog::query();
        if ($tab === 'mine') $query->where('user_id', $userId);
        elseif ($tab === 'shared-with-me') $query->where('user_id', '!=', $userId)->where(fn($q) => $q->where('is_public', true)->orWhereRaw('JSON_CONTAINS(shared_with, CAST(? AS JSON))', [json_encode($userId)]));
        elseif ($tab === 'shared-by-me') $query->where('user_id', $userId)->where(fn($q) => $q->where('is_public', true)->orWhereRaw('JSON_LENGTH(shared_with) > 0'));

        $column = $groupBy === 'user' ? 'user_id' : ($groupBy === 'exercise' ? 'exercise_id' : DB::raw("DATE_FORMAT(date, '%Y-%m')"));
        return $query->distinct()->count($column);
    }

    private function countLogsForTab(int $userId, string $tab): int {
        if ($tab === 'shared-with-me') return TrainingLog::where('user_id', '!=', $userId)->where(fn($q) => $q->where('is_public', true)->orWhereRaw('JSON_CONTAINS(shared_with, CAST(? AS JSON))', [json_encode($userId)]))->count();
        if ($tab === 'shared-by-me') return TrainingLog::where('user_id', $userId)->where(fn($q) => $q->where('is_public', true)->orWhereRaw('JSON_LENGTH(shared_with) > 0'))->count();
        return TrainingLog::where('user_id', $userId)->count();
    }

    private function filterByPrefix(array $settings, string $prefix): array {
        $result = [];
        $len = strlen($prefix);
        foreach ($settings as $key => $value) {
            if (strpos($key, $prefix) === 0) $result[substr($key, $len)] = $this->getTyped($key);
        }
        return $result;
    }
}
