<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\Training\TrainingLog;
use App\Models\Training\Exercise;
use App\Models\User;
use App\Models\Acl;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class TrainingLogController extends Controller
{
    /**
     * GET /api/training/logs
     */
    public function index(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $userId = Auth::id();
        $query = TrainingLog::with('exercise:id,name,type,default_unit')
            ->mine($userId)
            ->latest('date')
            ->latest('time');

        if ($request->filled('date')) $query->forDate($request->date);
        if ($request->filled('exercise_id')) $query->forExercise($request->exercise_id);
        if ($request->filled('from') && $request->filled('to')) $query->forDateRange($request->from, $request->to);
        if ($request->boolean('with_trashed')) $query->withTrashed();

        $perPage = $request->integer('per_page', 50);
        $logs = $request->boolean('all') ? $query->get() : $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items() ?? $logs,
            'meta' => $logs instanceof \Illuminate\Pagination\LengthAwarePaginator ? [
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                    'last_page' => $logs->lastPage(),
                ]
            ] : ['count' => count($logs)]
        ]);
    }

    /**
     * 🔥 STATS: Расчёт статистики за период
     */
    public function stats(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING_STATS)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $userId = Auth::id();
        $period = $request->get('period', 'week');
        $exerciseId = $request->get('exercise_id');
        $dateRange = $this->getDateRange($period);

        $baseQuery = TrainingLog::mine($userId)->whereBetween('date', [$dateRange['from'], $dateRange['to']]);
        if ($exerciseId) $baseQuery->forExercise($exerciseId);

        $stats = $baseQuery->selectRaw('
            COUNT(*) as total_sessions,
            COUNT(DISTINCT date) as active_days,
            COALESCE(SUM(total_volume), 0) as total_volume,
            COALESCE(SUM(JSON_LENGTH(sets)), 0) as total_sets
        ')->first();

        // Для total_reps всё ещё нужен PHP (нет отдельной колонки)
        $totalReps = $baseQuery->get(['sets'])->sum(function ($log) {
            return collect($log->sets)->sum(fn($s) => (int)($s['reps'] ?? 0));
        });

        return response()->json([
            'success' => true,
            'period' => $period,
            'from' => $dateRange['from'],
            'to' => $dateRange['to'],
            'data' => [
                'total_sessions' => (int)$stats->total_sessions,
                'active_days' => (int)$stats->active_days,
                'total_volume' => round((float)$stats->total_volume, 2),
                'total_reps' => (int)$totalReps,
            ],
        ]);
    }

    /**
     * 🔥 SUMMARY: Сводка для шапки дашборда
     */
    public function summary(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $userId = Auth::id();
        $today = now()->format('Y-m-d');
        $weekStart = now()->startOfWeek()->format('Y-m-d');

        $todayStats = TrainingLog::mine($userId)->forDate($today)
            ->selectRaw('COUNT(*) as sessions, COALESCE(SUM(JSON_LENGTH(sets)), 0) as total_sets')->first();

        $todayReps = TrainingLog::mine($userId)->forDate($today)->get(['sets'])
            ->sum(fn($log) => collect($log->sets)->sum(fn($s) => (int)($s['reps'] ?? 0)));

        $weekStats = TrainingLog::mine($userId)->forDateRange($weekStart, $today)
            ->selectRaw('COUNT(*) as sessions, COUNT(DISTINCT date) as active_days')->first();

        return response()->json([
            'success' => true,
            'today' => [
                'date' => $today,
                'sessions' => (int)$todayStats->sessions,
                'reps' => (int)$todayReps,
            ],
            'week' => [
                'from' => $weekStart,
                'to' => $today,
                'sessions' => (int)$weekStats->sessions,
                'active_days' => (int)$weekStats->active_days,
            ],
            'streak' => $this->calculateStreak($userId),
        ]);
    }

    /**
     * 🔥 SHARED: Просмотр чужих тренировок (НОВЫЙ МЕТОД)
     * GET /api/training/users/{username}/shared
     */
    public function shared(Request $request, string $username): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $user = User::where('username', $username)->firstOrFail();

        $query = TrainingLog::with('exercise:id,name,type,default_unit')
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('is_public', true)
                    ->orWhereJsonContains('shared_with', Auth::id());
            })
            ->latest('date')
            ->latest('time');

        // Фильтры (опционально)
        if ($request->filled('date')) $query->forDate($request->date);
        if ($request->filled('from') && $request->filled('to')) $query->forDateRange($request->from, $request->to);
        if ($request->filled('exercise_id')) $query->forExercise($request->exercise_id);

        $perPage = $request->integer('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                    'last_page' => $logs->lastPage(),
                ]
            ]
        ]);
    }

    /**
     * POST /api/training/logs - Создание записи
     */
    public function store(Request $request): JsonResponse
    {
        $this->checkCreatePermission();

        $data = $request->validate($this->validationRules());
        $data['user_id'] = Auth::id();
        $this->validateSharedWith($data);

        $log = TrainingLog::create($data);
        $log->load('exercise:id,name,type,default_unit');

        return response()->json(['success' => true, 'message' => 'Запись создана', 'data' => $log], 201);
    }

    /**
     * PUT /api/training/logs/{log} - Обновление
     */
    public function update(Request $request, TrainingLog $log): JsonResponse
    {
        $this->authorizeUpdate($log);

        $data = $request->validate($this->validationRules(true));
        $this->validateSharedWith($data);

        $log->update($data);
        $log->load('exercise:id,name,type,default_unit');

        return response()->json(['success' => true, 'message' => 'Запись обновлена', 'data' => $log]);
    }

    /**
     * DELETE /api/training/logs/{log} - Удаление
     */
    public function destroy(TrainingLog $log): JsonResponse
    {
        $this->authorizeUpdate($log);
        $log->delete();
        return response()->json(['success' => true, 'message' => 'Запись удалена']);
    }

    // ========================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ========================================================================

    private function checkCreatePermission(): void
    {
        if (!Auth::user()->can(Acl::PERMISSION_MANAGE_TRAINING) &&
            !Auth::user()->can(Acl::PERMISSION_MANAGE_OWN_TRAINING)) {
            abort(403, 'Недостаточно прав для создания записи');
        }
    }

    private function authorizeUpdate(TrainingLog $log): void
    {
        $userId = Auth::id();
        if (Auth::user()->can(Acl::PERMISSION_MANAGE_TRAINING)) return;
        if ($log->user_id !== $userId) abort(403, 'Доступ запрещён: вы не владелец');
        if (!Auth::user()->can(Acl::PERMISSION_MANAGE_OWN_TRAINING)) abort(403, 'Недостаточно прав');
    }

    private function validationRules(bool $isUpdate = false): array
    {
        $req = $isUpdate ? 'sometimes' : 'required';
        return [
            'exercise_id' => "{$req}|exists:exercises,id",
            'date' => "{$req}|date",
            'time' => "{$req}|date_format:H:i",
            'sets' => "{$req}|array|min:1",
            'sets.*.reps' => 'nullable|integer|min:0',
            'sets.*.weight' => 'nullable|numeric|min:0',
            'sets.*.duration' => 'nullable|integer|min:0',
            'sets.*.distance' => 'nullable|numeric|min:0',
            'is_public' => 'nullable|boolean',
            'shared_with' => 'nullable|array|max:10',
            'notes' => 'nullable|string|max:1000',
            'rating' => 'nullable|integer|min:1|max:5',
        ];
    }

    private function validateSharedWith(array &$data): void
    {
        $currentUserId = Auth::id();
        if (!empty($data['shared_with']) && in_array((int)$currentUserId, array_map('intval', $data['shared_with']))) {
            abort(422, json_encode(['shared_with' => ['Нельзя поделиться с самим собой']]));
        }
    }

    private function getDateRange(string $period): array
    {
        $now = now();
        return match ($period) {
            'day' => ['from' => $now->startOfDay()->format('Y-m-d'), 'to' => $now->endOfDay()->format('Y-m-d')],
            'week' => ['from' => $now->startOfWeek()->format('Y-m-d'), 'to' => $now->endOfWeek()->format('Y-m-d')],
            'month' => ['from' => $now->startOfMonth()->format('Y-m-d'), 'to' => $now->endOfMonth()->format('Y-m-d')],
            'year' => ['from' => $now->startOfYear()->format('Y-m-d'), 'to' => $now->endOfYear()->format('Y-m-d')],
            default => ['from' => $now->subYear()->startOfDay()->format('Y-m-d'), 'to' => $now->endOfDay()->format('Y-m-d')],
        };
    }

    private function calculateStreak(int $userId): int
    {
        $dates = TrainingLog::mine($userId)->orderByDesc('date')->pluck('date')
            ->map(fn($d) => $d->format('Y-m-d'))->unique()->values();

        if ($dates->isEmpty()) return 0;

        $streak = 1;
        $current = Carbon::parse($dates[0]);

        for ($i = 1; $i < $dates->count(); $i++) {
            $prev = Carbon::parse($dates[$i]);
            $diff = $current->diffInDays($prev);

            if ($diff === 1) {
                $streak++;
                $current = $prev;
            } elseif ($diff > 1) {
                break;
            }
        }

        return $streak;
    }
}
