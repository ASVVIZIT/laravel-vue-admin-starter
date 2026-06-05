<?php

namespace App\Services\Training;

use App\Models\Training\TrainingSetting;
use App\Models\Training\TrainingLog;
use Illuminate\Support\Facades\Cache;

class TrainingSettingsService
{
    private const CACHE_KEY = 'training_settings_all';
    private const CACHE_TTL = 3600; // 1 час

    private const TABS = ['mine', 'shared-with-me', 'shared-by-me'];

    private const DEFAULT_COLUMNS = [
        'mine' => [
            'date' => true, 'time' => true, 'exercise' => true, 'sharing' => true,
            'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true
        ],
        'shared-with-me' => [
            'date' => true, 'time' => true, 'exercise' => true, 'sharing' => true,
            'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => false
        ],
        'shared-by-me' => [
            'date' => true, 'time' => true, 'exercise' => true, 'sharing' => true,
            'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true
        ],
    ];

    /**
     * Получает все настройки из кэша или БД
     */
    private function getAllSettings(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return TrainingSetting::pluck('value', 'key')->toArray();
        });
    }

    /**
     * Возвращает настройки, сгруппированные по префиксам
     */
    public function getAllGrouped(): array
    {
        $all = $this->getAllSettings();
        return [
            'server' => $this->filterByPrefix($all, 'server.'),
            'frontend' => $this->filterByPrefix($all, 'frontend.'),
        ];
    }

    /**
     * Получает сырое строковое значение по ключу
     */
    public function get(string $key, $default = null)
    {
        $all = $this->getAllSettings();
        return isset($all[$key]) ? $all[$key] : $default;
    }

    /**
     * 🔥 ГЛАВНЫЙ МЕТОД: Приводит строку из БД к правильному типу PHP
     */
    public function getTyped(string $key, $default = null)
    {
        $value = $this->get($key);

        if ($value === null) {
            return $default;
        }

        // 1. Проверка на булевы значения (true, false, 1, 0)
        $lowerValue = strtolower((string)$value);
        if (in_array($lowerValue, ['true', 'false', '1', '0'], true)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }

        // 2. Проверка на числа (int или float)
        if (is_numeric($value)) {
            return strpos((string)$value, '.') !== false ? (float)$value : (int)$value;
        }

        // 3. Проверка на JSON (массивы/объекты)
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        // 4. Если ничего не подошло, возвращаем как есть (строку)
        return $value;
    }

    /**
     * Сохраняет значение в БД, приводя его к строке, и очищает кэш
     */
    public function set(string $key, $value): void
    {
        $dbValue = $value;

        if (is_bool($value)) {
            $dbValue = $value ? 'true' : 'false';
        } elseif (is_array($value)) {
            $dbValue = json_encode($value);
        } elseif (is_numeric($value)) {
            $dbValue = (string)$value;
        }

        TrainingSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $dbValue]
        );

        // Мгновенная инвалидация кэша
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Возвращает конфигурацию видимости колонок для всех вкладок
     */
    public function getColumnsConfig(): array
    {
        $config = [];
        foreach (self::TABS as $tab) {
            $key = "frontend.columns.{$tab}";
            $value = $this->getTyped($key);

            // Если в БД лежит корректный массив, берем его, иначе дефолт
            $config[$tab] = is_array($value) ? $value : self::DEFAULT_COLUMNS[$tab];
        }
        return $config;
    }

    /**
     * Определяет, какой режим группировки использовать для конкретной вкладки
     */
    public function resolveGroupingMode(int $userId, string $tab): array
    {
        $mode = $this->getTyped('server.grouping_mode', 'auto');
        $threshold = $this->getTyped('server.grouping_auto_threshold', 500);
        $serverBy = $this->getTyped('server.grouping_by', 'user');

        // Если режим задан вручную, порог не считаем
        if ($mode !== 'auto') {
            return [
                'mode' => $mode,
                'server_by' => $serverBy,
                'reason' => "Ручной режим: {$mode}"
            ];
        }

        // Авто-режим: считаем количество записей
        $count = $this->countLogsForTab($userId, $tab);

        if ($count >= $threshold) {
            return [
                'mode' => 'server',
                'server_by' => $serverBy,
                'count' => $count,
                'threshold' => $threshold,
                'reason' => "Авто: {$count} >= {$threshold}"
            ];
        }

        return [
            'mode' => 'frontend',
            'count' => $count,
            'threshold' => $threshold,
            'reason' => "Авто: {$count} < {$threshold}"
        ];
    }

    /**
     * Подсчитывает количество записей для вкладки (быстрый COUNT)
     */
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

        // Вкладка 'mine'
        return TrainingLog::where('user_id', $userId)->count();
    }

    /**
     * Фильтрует массив настроек по префиксу ключа (совместимо с PHP 7.4+)
     */
    private function filterByPrefix(array $settings, string $prefix): array
    {
        $result = [];
        $prefixLen = strlen($prefix);

        foreach ($settings as $key => $value) {
            // strpos === 0 надежнее и совместимее, чем str_starts_with
            if (strpos($key, $prefix) === 0) {
                $result[substr($key, $prefixLen)] = $this->getTyped($key);
            }
        }

        return $result;
    }

    /**
     * Принудительная очистка кэша (если понадобится вручную)
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
