<?php

namespace App\Services\Training;

use App\Models\Training\TrainingLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TrainingCsvExportService
{
    private array $usersMap = [];

    public function export(array $filters = []): StreamedResponse
    {
        $tab = $filters['tab'] ?? 'mine';
        $fileName = "training_logs_{$tab}_" . now()->format('Y-m-d') . ".csv";
        $encodedFileName = rawurlencode($fileName);

        $headers = ['Дата', 'Время', 'Упражнение', 'Доступ', 'Подходы', 'Всего повторов', 'Объём (кг)', 'Оценка'];

        return response()->streamDownload(function () use ($filters, $headers) {
            $handle = fopen('php://output', 'w');

            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, $headers, ';');

            // Базовый запрос
            $query = TrainingLog::query()
                ->with(['exercise'])
                ->where('user_id', Auth::id());

            if (!empty($filters['date_from'])) $query->whereDate('date', '>=', $filters['date_from']);
            if (!empty($filters['date_to']))   $query->whereDate('date', '<=', $filters['date_to']);
            if (!empty($filters['exercise_id'])) $query->where('exercise_id', $filters['exercise_id']);

            if (($filters['tab'] ?? '') === 'shared-with-me') {
                $query->whereJsonContains('shared_with', Auth::id());
            } elseif (($filters['tab'] ?? '') === 'shared-by-me') {
                $query->where('user_id', Auth::id())->where(function($q) {
                    $q->where('is_public', true)->orWhereJsonLength('shared_with', '>', 0);
                });
            }

            $query->orderBy('date', 'desc')->orderBy('time', 'desc');

            // 🔥 КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Предварительная загрузка ВСЕХ пользователей
            $this->preloadAllUsers($query);

            // Потоковая обработка
            $query->lazyById(500, 'id')->each(function ($log) use ($handle) {
                $row = [
                    $this->formatDate($log->date),
                    $this->formatTime($log->time),
                    $log->exercise?->name ?? 'Удалено',
                    $this->formatAccess($log->shared_with),
                    $this->formatSets($log->sets),
                    $this->formatNumber($this->calcReps($log->sets)),
                    $this->formatNumber($log->total_volume ?? 0),
                    $log->rating ? "{$log->rating}/5" : '',
                ];

                fputcsv($handle, $row, ';');
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"; filename*=UTF-8''{$encodedFileName}",
            'Content-Transfer-Encoding' => 'binary',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'X-Content-Type-Options' => 'nosniff',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }

    /**
     * 🔥 Предварительная загрузка ВСЕХ пользователей из shared_with
     * Делает ОДИН запрос к БД перед началом обработки
     */
    private function preloadAllUsers($query): void
    {
        // Клонируем запрос, чтобы не трогать оригинал
        $clone = clone $query;

        // Собираем все уникальные ID из shared_with
        $allUserIds = [];
        $clone->select('shared_with')->lazyById(1000, 'id')->each(function ($log) use (&$allUserIds) {
            if (is_array($log->shared_with)) {
                foreach ($log->shared_with as $id) {
                    $allUserIds[] = (int)$id;
                }
            }
        });

        $uniqueIds = array_unique(array_filter($allUserIds));

        if (empty($uniqueIds)) {
            $this->usersMap = [];
            return;
        }

        // 🔥 ОДИН запрос — загружаем всех пользователей сразу
        $this->usersMap = User::whereIn('id', $uniqueIds)
            ->pluck('name', 'id')
            ->map(fn($name, $id) => $name ?: "Пользователь #{$id}")
            ->toArray();
    }

    private function formatDate($date): string
    {
        if (!$date) return '';
        if ($date instanceof \Carbon\Carbon) {
            return $date->format('d.m.Y');
        }
        return \Carbon\Carbon::parse($date)->format('d.m.Y');
    }

    private function formatTime($time): string
    {
        return $time ? substr((string)$time, 0, 5) : '';
    }

    /**
     * 🔥 Форматирует доступ: каждое имя с новой строки, разделённое запятой
     */
    private function formatAccess($sharedWith): string
    {
        if (empty($sharedWith)) return 'Личный';

        $names = [];
        foreach ($sharedWith as $userId) {
            $userId = (int)$userId;
            if (isset($this->usersMap[$userId])) {
                $names[] = $this->usersMap[$userId];
            } else {
                $names[] = "Пользователь #{$userId}";
            }
        }

        // 🔥 Каждое имя с новой строки, разделённое запятой
        return 'Доступен: ' . implode(",\n", $names);
    }

    private function formatSets($setsJson): string
    {
        $sets = is_string($setsJson) ? json_decode($setsJson, true) : $setsJson;
        if (!is_array($sets) || empty($sets)) return 'Нет данных';

        $out = [];
        foreach ($sets as $i => $s) {
            if (!is_array($s)) continue;
            $parts = [];

            if (!empty($s['reps'])) $parts[] = $s['reps'] . 'x';
            if (!empty($s['weight'])) {
                $weight = (string)$s['weight'];
                $parts[] = str_replace('.', ',', $weight) . 'кг';
            }

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

            if (!empty($s['notes'])) {
                $note = str_replace(["\r", "\n", '"'], [' ', ' ', "'"], trim($s['notes']));
                if ($note) $base .= " ({$note})";
            }
            $out[] = ($i + 1) . ". {$base}";
        }
        return implode("\n", $out);
    }

    private function calcReps($setsJson): int
    {
        $sets = is_string($setsJson) ? json_decode($setsJson, true) : $setsJson;
        if (!is_array($sets)) return 0;
        return array_sum(array_map(fn($s) => (int)($s['reps'] ?? 0), $sets));
    }

    private function formatNumber($num): string
    {
        return number_format((float)$num, 1, ',', ' ');
    }
}
