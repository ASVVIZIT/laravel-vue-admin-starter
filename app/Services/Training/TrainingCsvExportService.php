<?php

namespace App\Services\Training;

use App\Models\Training\TrainingLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TrainingCsvExportService
{
    private array $usersMap = [];
    private array $pendingUserIds = [];

    public function export(array $filters = []): StreamedResponse
    {
        $tab = $filters['tab'] ?? 'mine';
        $fileName = "training_logs_{$tab}_" . now()->format('Y-m-d') . ".csv";

        $headers = ['Дата', 'Время', 'Упражнение', 'Доступ', 'Подходы', 'Всего повторов', 'Объём (кг)', 'Оценка'];

        return response()->streamDownload(function () use ($filters, $headers) {
            $handle = fopen('php://output', 'w');

            // BOM для корректного отображения кириллицы в Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, $headers, ';');

            // ВАЖНО: Только 'exercise'. НИКАКОГО 'sharedWithUsers'!
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

            // Потоковая обработка (O(1) память)
            $query->lazyById(500, 'id')->each(function ($log) use ($handle) {
                // Собираем ID напрямую из JSON-колонки
                $sharedIds = is_array($log->shared_with) ? $log->shared_with : [];
                $this->ensureUsersLoaded($sharedIds);

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

            $this->flushPendingUsers();
            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate'
        ]);
    }

    private function ensureUsersLoaded(array $userIds): void
    {
        $userIds = array_map('intval', array_filter($userIds));
        $newIds = array_diff($userIds, array_keys($this->usersMap));
        if (empty($newIds)) return;

        $this->pendingUserIds = array_merge($this->pendingUserIds, $newIds);

        if (count($this->pendingUserIds) >= 1000) {
            $this->flushPendingUsers();
        }
    }

    private function flushPendingUsers(): void
    {
        if (empty($this->pendingUserIds)) return;

        $uniqueIds = array_unique($this->pendingUserIds);

        $users = User::whereIn('id', $uniqueIds)
            ->get(['id', 'name', 'email'])
            ->mapWithKeys(fn($user) => [(int)$user->id => $user->name ?: $user->email])
            ->toArray();

        $this->usersMap = array_merge($this->usersMap, $users);
        $this->pendingUserIds = [];
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

    private function formatAccess($sharedWith): string
    {
        if (empty($sharedWith)) return 'Личный';

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
