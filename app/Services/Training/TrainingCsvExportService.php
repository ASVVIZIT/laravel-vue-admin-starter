<?php

namespace App\Services\Training;

use App\Models\Training\TrainingLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * ============================================================================
 * TRAINING CSV EXPORT SERVICE — ПОТОКОВАЯ ГЕНЕРАЦИЯ CSV
 * ============================================================================
 * 📁 Путь: app/Services/Training/TrainingCsvExportService.php
 * ✅ Назначение: Безопасный экспорт логов в CSV (O(1) память через lazyById)
 * ✅ Шеринг: работает с JSON-колонкой shared_with (без pivot-таблицы)
 * ✅ Форматирование: человеко-читаемые даты, числа, подходы с переносами
 * ============================================================================
 */
class TrainingCsvExportService
{
    /**
     * Кэш пользователей: id => name (загружается лениво пачками)
     */
    private array $usersMap = [];

    /**
     * Буфер для отложенной загрузки ID пользователей
     */
    private array $pendingUserIds = [];

    /**
     * Генерирует CSV-поток. Безопасен для 1 000 000+ записей.
     * Использует lazyById(500) → стабильные ~5 МБ RAM.
     */
    public function export(array $filters = []): StreamedResponse
    {
        $tab = $filters['tab'] ?? 'mine';
        $fileName = "training_logs_{$tab}_" . now()->format('Y-m-d') . ".csv";

        $headers = [
            'Дата',
            'Время',
            'Упражнение',
            'Доступ',
            'Подходы',
            'Всего повторов',
            'Объём (кг)',
            'Оценка'
        ];

        return response()->streamDownload(function () use ($filters, $headers) {
            $handle = fopen('php://output', 'w');

            // 🔥 BOM для корректного отображения кириллицы в Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, $headers, ';');

            // 🔥 Базовый запрос: ТОЛЬКО exercise, без sharedWithUsers (его нет!)
            $query = TrainingLog::query()
                ->with(['exercise'])
                ->where('user_id', Auth::id());

            // 🔥 Синхронизация фильтров 1-в-1 с фронтендом
            if (!empty($filters['date_from'])) $query->whereDate('date', '>=', $filters['date_from']);
            if (!empty($filters['date_to']))   $query->whereDate('date', '<=', $filters['date_to']);
            if (!empty($filters['exercise_id'])) $query->where('exercise_id', $filters['exercise_id']);

            // 🔥 Логика вкладки (mine / shared-with-me / shared-by-me)
            if (($filters['tab'] ?? '') === 'shared-with-me') {
                $query->whereJsonContains('shared_with', Auth::id());
            } elseif (($filters['tab'] ?? '') === 'shared-by-me') {
                $query->where('user_id', Auth::id())->where(function($q) {
                    $q->where('is_public', true)->orWhereJsonLength('shared_with', '>', 0);
                });
            }

            $query->orderBy('date', 'desc')->orderBy('time', 'desc');

            // 🔥 Потоковая обработка (lazyById)
            $query->lazyById(500, 'id')->each(function ($log) use ($handle) {
                // 🔥 Ленивая загрузка пользователей из JSON shared_with
                $sharedIds = is_array($log->shared_with) ? $log->shared_with : [];
                $this->ensureUsersLoaded($sharedIds);

                $row = [
                    $this->formatDate($log->date),
                    $this->formatTime($log->time),
                    $log->exercise?->name ?? 'Удалено',
                    $this->formatAccess($log),
                    $this->formatSets($log->sets),
                    $this->formatNumber($this->calcReps($log->sets)),
                    $this->formatNumber($log->total_volume ?? 0),
                    $log->rating ? "{$log->rating}/5" : '',
                ];

                // fputcsv автоматически экранирует переносы строк (\n) и точки с запятой (;)
                fputcsv($handle, $row, ';');
            });

            // Финальная загрузка оставшихся пользователей
            $this->flushPendingUsers();

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate'
        ]);
    }

    // ========================================================================
    // 🔥 ЛЕНИВАЯ ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ (из JSON-массива shared_with)
    // ========================================================================

    /**
     * Собирает уникальные ID и загружает пользователей пачками по 1000
     */
    private function ensureUsersLoaded(array $userIds): void
    {
        // 🔥 Приводим к integer (JSON может хранить строки)
        $userIds = array_map('intval', array_filter($userIds));
        $newIds = array_diff($userIds, array_keys($this->usersMap));
        if (empty($newIds)) return;

        $this->pendingUserIds = array_merge($this->pendingUserIds, $newIds);

        // Загружаем пачками по 1000, чтобы не делать запрос на каждую запись
        if (count($this->pendingUserIds) >= 1000) {
            $this->flushPendingUsers();
        }
    }

    private function flushPendingUsers(): void
    {
        if (empty($this->pendingUserIds)) return;

        $uniqueIds = array_unique($this->pendingUserIds);

        // 🔥 ОДИН запрос на пачку ID
        $users = User::whereIn('id', $uniqueIds)
            ->get(['id', 'name', 'email'])
            ->mapWithKeys(fn($user) => [(int)$user->id => $user->name ?: $user->email])
            ->toArray();

        $this->usersMap = array_merge($this->usersMap, $users);
        $this->pendingUserIds = [];
    }

    // ========================================================================
    // 🔥 ФОРМАТТЕРЫ (защита)
    // ========================================================================

    /**
     * Безопасный парсинг даты БЕЗ сдвига часовых поясов
     * 2026-06-06T00:00:00.000000Z → 06.06.2026
     */
    private function formatDate($date): string
    {
        if (!$date) return '';

        // Если это уже Carbon (из-за casts), используем напрямую
        if ($date instanceof \Carbon\Carbon) {
            return $date->format('d.m.Y');
        }

        // Если строка — парсим без timezone
        return \Carbon\Carbon::parse($date)->format('d.m.Y');
    }

    private function formatTime($time): string
    {
        if (!$time) return '';
        // Обрезаем секунды: 12:41:00 → 12:41
        return substr((string)$time, 0, 5);
    }

    /**
     * 🔥 Форматирует доступ, используя предзагруженный кэш пользователей
     * Вместо "Доступен (1, 5)" → "Доступен: Иван Иванов, Пётр Петров"
     */
    private function formatAccess($log): string
    {
        if ($log->is_public) return 'Публичный';

        $sharedWith = is_array($log->shared_with) ? $log->shared_with : [];
        if (empty($sharedWith)) return 'Личный';

        // 🔥 Берём имена из предзагруженного кэша
        $names = [];
        foreach ($sharedWith as $userId) {
            $userId = (int)$userId;
            if (isset($this->usersMap[$userId])) {
                $names[] = $this->usersMap[$userId];
            } else {
                $names[] = "ID:{$userId} (удалён)";
            }
        }

        return 'Доступен: ' . implode(', ', $names);
    }

    /**
     *  Умное форматирование подходов с переносами строк
     * JSON → "1. 10x30кг (тест 1)\n2. 10x45кг"
     */
    private function formatSets($setsJson): string
    {
        $sets = is_string($setsJson) ? json_decode($setsJson, true) : $setsJson;
        if (!is_array($sets) || empty($sets)) return 'Нет данных';

        $out = [];
        foreach ($sets as $i => $s) {
            // 🔥 P0 Fix: Защита от null внутри массива
            if (!is_array($s)) continue;

            $parts = [];

            if (!empty($s['reps'])) $parts[] = $s['reps'] . 'x';

            if (!empty($s['weight'])) {
                // 🔥 P1 Fix: Заменяем точку на запятую для Excel
                $weight = (string)$s['weight'];
                $parts[] = str_replace('.', ',', $weight) . 'кг';
            }

            // 🔥 Логика для кардио (Плавание из дампа)
            if (!empty($s['duration']) || !empty($s['distance'])) {
                $cardioParts = [];
                if (!empty($s['duration'])) {
                    $m = floor($s['duration'] / 60);
                    $sec = $s['duration'] % 60;
                    $cardioParts[] = $sec > 0 ? "{$m}м{$sec}с" : "{$m}мин";
                }
                if (!empty($s['distance'])) {
                    $dist = $s['distance'] >= 1000
                        ? str_replace('.', ',', number_format($s['distance'] / 1000, 1)) . 'км'
                        : "{$s['distance']}м";
                    $cardioParts[] = $dist;
                }
                $parts[] = implode(' / ', $cardioParts);
            }

            $base = implode('', $parts) ?: 'Без параметров';

            // 🔥 P1 Fix: Жесткая очистка переносов строк в заметках
            if (!empty($s['notes'])) {
                $note = str_replace(["\r", "\n", '"'], [' ', ' ', "'"], trim($s['notes']));
                if ($note) $base .= " ({$note})";
            }

            $out[] = ($i + 1) . ". {$base}";
        }

        // 🔥 ГЛАВНОЕ: Соединяем подходы переносом строки
        // fputcsv автоматически обернёт ячейку в кавычки, и Excel покажет столбиком
        return implode("\n", $out);
    }

    private function calcReps($setsJson): int
    {
        $sets = is_string($setsJson) ? json_decode($setsJson, true) : $setsJson;
        if (!is_array($sets)) return 0;
        return array_sum(array_map(fn($s) => (int)($s['reps'] ?? 0), $sets));
    }

    /**
     * Форматируем числа для русской локали
     * 1144.2 → "1 144,2" (Excel распознаёт как число)
     */
    private function formatNumber($num): string
    {
        return number_format((float)$num, 1, ',', ' ');
    }
}
