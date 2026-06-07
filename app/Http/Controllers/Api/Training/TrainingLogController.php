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
     * Поддержка вкладок: mine / shared_with_me / shared_by_me
     */
    public function index(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $userId = Auth::id();
        $query = $this->buildTabQuery($userId, $request);

        // Фильтры (работают для всех вкладок)
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
     * GET /api/training/logs/grouped
     * 🔥 СЕРВЕРНАЯ ГРУППИРОВКА записей
     *
     * Параметры:
     * - tab: mine | shared-with-me | shared-by-me
     * - group_by: user | exercise | date
     * - page, per_page (пагинация по группам, а не по записям)
     */
    public function grouped(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $userId = Auth::id();
        $tab = $request->get('tab', 'mine');
        $groupBy = $request->get('group_by', 'user');
        $perPage = $request->integer('per_page', 10);
        $page = $request->integer('page', 1);

        // Базовый запрос по вкладке
        $query = $this->buildTabQuery($userId, $request, $tab);

        // Загружаем все записи (без пагинации — группировка на сервере)
        $logs = $query->with('exercise:id,name,type,default_unit', 'user:id,name,email')
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

        // Группируем по выбранному полю
        $groups = $logs->groupBy(function ($log) use ($groupBy) {
            return match ($groupBy) {
                'user' => "user_{$log->user_id}",
                'exercise' => "exercise_{$log->exercise_id}",
                'date' => $log->date instanceof Carbon
                    ? $log->date->format('Y-m')
                    : \Carbon\Carbon::parse($log->date)->format('Y-m'),
                default => "user_{$log->user_id}",
            };
        });

        // Формируем структуру групп
        $groupedData = $groups->map(function ($items, $key) use ($groupBy) {
            $first = $items->first();
            $label = match ($groupBy) {
                'user' => $first->user?->name ?? "Пользователь #{$first->user_id}",
                'exercise' => $first->exercise?->name ?? "Упражнение #{$first->exercise_id}",
                'date' => $first->date instanceof Carbon
                    ? $first->date->format('F Y')
                    : \Carbon\Carbon::parse($first->date)->format('F Y'),
                default => $key,
            };

            return [
                'group_key' => $key,
                'group_label' => $label,
                'count' => $items->count(),
                'children' => $items->values(),
            ];
        })->values();

        // Ручная пагинация по группам
        $totalGroups = $groupedData->count();
        $lastPage = max(1, (int) ceil($totalGroups / $perPage));
        $paginatedGroups = $groupedData->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'success' => true,
            'data' => $paginatedGroups,
            'meta' => [
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $totalGroups,
                    'last_page' => $lastPage,
                ],
                'grouping' => [
                    'mode' => 'server',
                    'group_by' => $groupBy,
                    'total_logs' => $logs->count(),
                ]
            ]
        ]);
    }

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
     * GET /api/training/users/{user}/shared
     * Просмотр чужих тренировок по ID пользователя
     */
    public function shared(Request $request, int $user): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $owner = User::findOrFail($user);

        $query = TrainingLog::with('exercise:id,name,type,default_unit', 'user:id,name,email')
            ->where('user_id', $owner->id)
            ->where(function ($q) {
                $q->where('is_public', true)
                    ->orWhereJsonContains('shared_with', Auth::id());
            })
            ->latest('date')
            ->latest('time');

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

    public function update(Request $request, TrainingLog $log): JsonResponse
    {
        $this->authorizeUpdate($log);

        $data = $request->validate($this->validationRules(true));
        $this->validateSharedWith($data);

        $log->update($data);
        $log->load('exercise:id,name,type,default_unit');

        return response()->json(['success' => true, 'message' => 'Запись обновлена', 'data' => $log]);
    }

    public function destroy(TrainingLog $log): JsonResponse
    {
        $this->authorizeUpdate($log);
        $log->delete();
        return response()->json(['success' => true, 'message' => 'Запись удалена']);
    }

    /**
     * POST /api/training/logs/{log}/restore
     * 🔥 Восстановление удалённой записи (soft delete)
     */
    public function restore(TrainingLog $log): JsonResponse
    {
        $this->authorizeUpdate($log);

        if (!$log->trashed()) {
            return response()->json(['success' => false, 'message' => 'Запись не удалена'], 400);
        }

        $log->restore();
        return response()->json(['success' => true, 'message' => 'Запись восстановлена', 'data' => $log]);
    }

    /**
     * DELETE /api/training/logs/{log}/force
     * 🔥 Полное (безвозвратное) удаление записи
     */
    public function forceDelete(TrainingLog $log): JsonResponse
    {
        // Полное удаление требует полных прав (manage_training)
        if (!Auth::user()->can(Acl::PERMISSION_MANAGE_TRAINING)) {
            abort(403, 'Недостаточно прав для полного удаления');
        }

        $log->forceDelete();
        return response()->json(['success' => true, 'message' => 'Запись удалена безвозвратно']);
    }

    // ========================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ========================================================================

    /**
     * 🔥 Построение базового запроса для вкладки
     * Используется в index() и grouped() — единая логика для всех методов
     *
     * @param int $userId ID текущего пользователя
     * @param Request $request HTTP-запрос
     * @param string|null $tabOverride Явное указание вкладки (для grouped)
     */
    private function buildTabQuery(int $userId, Request $request, ?string $tabOverride = null)
    {
        $tab = $tabOverride ?? $this->resolveTab($request);

        return match ($tab) {
            'shared-with-me' => TrainingLog::with('exercise:id,name,type,default_unit', 'user:id,name,email')
                ->where('user_id', '!=', $userId)
                ->where(function ($q) use ($userId) {
                    $q->where('is_public', true)
                        ->orWhereRaw('JSON_CONTAINS(shared_with, CAST(? AS JSON))', [json_encode($userId)]);
                })
                ->latest('date')
                ->latest('time'),

            'shared-by-me' => TrainingLog::with('exercise:id,name,type,default_unit', 'user:id,name,email')
                ->where('user_id', $userId)
                ->where(function ($q) {
                    $q->where('is_public', true)
                        ->orWhereRaw('JSON_LENGTH(shared_with) > 0');
                })
                ->latest('date')
                ->latest('time'),

            default => TrainingLog::with('exercise:id,name,type,default_unit', 'user:id,name,email')
                ->mine($userId)
                ->latest('date')
                ->latest('time'),
        };
    }

    /**
     * Определение вкладки по параметрам запроса
     */
    private function resolveTab(Request $request): string
    {
        if ($request->boolean('shared_with_me')) return 'shared-with-me';
        if ($request->boolean('shared_by_me')) return 'shared-by-me';
        return 'mine';
    }

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
        // 🔥 Динамический лимит из единой точки правды
        $maxSharedWith = TrainingSettingsController::getLimit('max_shared_with');

        return [
            'exercise_id' => "{$req}|exists:exercises,id",
            'date' => "{$req}|date",
            'time' => "{$req}|date_format:H:i",
            'sets' => ["{$req}", 'array', 'min:1'],
            'sets.*' => Rule::forEach(function () {
                return [
                    'reps' => 'nullable|integer|min:0|max:1000',
                    'weight' => 'nullable|numeric|min:0|max:1000',
                    'duration' => 'nullable|integer|min:0|max:86400',
                    'distance' => 'nullable|numeric|min:0|max:42195',
                    'notes' => 'nullable|string|max:1000',
                ];
            }),
            'is_public' => 'nullable|boolean',
            'shared_with' => "nullable|array|max:{$maxSharedWith}", // 🔥 Динамический лимит
            'shared_with.*' => 'integer|exists:users,id',
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
            ->map(fn($d) => $d instanceof Carbon ? $d->format('Y-m-d') : Carbon::parse($d)->format('Y-m-d'))
            ->unique()->values();

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
