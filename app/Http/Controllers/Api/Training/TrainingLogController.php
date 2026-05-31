<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\Training\TrainingLog;
use App\Models\Acl;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class TrainingLogController extends Controller
{
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

    public function restore(TrainingLog $log): JsonResponse
    {
        $this->authorizeUpdate($log);
        if (!$log->trashed()) return response()->json(['success' => false, 'message' => 'Запись не удалена'], 400);
        $log->restore();
        $log->load('exercise:id,name,type,default_unit');
        return response()->json(['success' => true, 'message' => 'Запись восстановлена', 'data' => $log]);
    }

    public function forceDelete(TrainingLog $log): JsonResponse
    {
        $this->authorizeUpdate($log);
        $log->forceDelete();
        return response()->json(['success' => true, 'message' => 'Запись удалена навсегда']);
    }

    public function stats(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING_STATS)) {
            return response()->json(['success' => false, 'message' => 'Доступ к статистике запрещён'], 403);
        }

        $userId = Auth::id();
        $period = $request->get('period', 'week');
        $exerciseId = $request->get('exercise_id');
        $dateRange = $this->getDateRange($period);

        $query = TrainingLog::mine($userId)->whereBetween('date', [$dateRange['from'], $dateRange['to']]);
        if ($exerciseId) $query->forExercise($exerciseId);

        $stats = $query->selectRaw('
            COUNT(*) as total_sessions,
            COUNT(DISTINCT date) as active_days,
            SUM(JSON_LENGTH(sets)) as total_sets,
            SUM(CAST(JSON_EXTRACT(sets, "$[*].reps") AS UNSIGNED)) as total_reps,
            SUM(CAST(JSON_EXTRACT(sets, "$[*].reps") AS UNSIGNED) * COALESCE(CAST(JSON_EXTRACT(sets, "$[*].weight") AS DECIMAL(10,2)), 0)) as total_volume
        ')->first();

        return response()->json([
            'success' => true,
            'period' => $period,
            'from' => $dateRange['from'],
            'to' => $dateRange['to'],
            'exercise_id' => $exerciseId,
            'data' => [
                'total_sessions' => (int)($stats->total_sessions ?? 0),
                'active_days' => (int)($stats->active_days ?? 0),
                'total_sets' => (int)($stats->total_sets ?? 0),
                'total_reps' => (int)($stats->total_reps ?? 0),
                'total_volume' => round((float)($stats->total_volume ?? 0), 2),
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
            ->selectRaw('COUNT(*) as sessions, SUM(JSON_LENGTH(sets)) as sets, SUM(CAST(JSON_EXTRACT(sets, "$[*].reps") AS UNSIGNED)) as reps')->first();

        $weekStats = TrainingLog::mine($userId)->forDateRange($weekStart, $today)
            ->selectRaw('COUNT(*) as sessions, COUNT(DISTINCT date) as active_days')->first();

        return response()->json([
            'success' => true,
            'today' => [
                'date' => $today,
                'sessions' => (int)($todayStats->sessions ?? 0),
                'sets' => (int)($todayStats->sets ?? 0),
                'reps' => (int)($todayStats->reps ?? 0),
            ],
            'week' => [
                'from' => $weekStart, 'to' => $today,
                'sessions' => (int)($weekStats->sessions ?? 0),
                'active_days' => (int)($weekStats->active_days ?? 0),
            ],
            'streak' => $this->calculateStreak($userId),
        ]);
    }

    public function shared(string $username, Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $viewerId = Auth::id();
        $targetUser = \App\Models\User::where('name', $username)->firstOrFail();

        if ($targetUser->id === $viewerId) {
            return response()->json(['success' => false, 'message' => 'Используйте /api/training/logs для своих записей'], 400);
        }

        $query = TrainingLog::with('exercise:id,name,type,default_unit', 'user:id,name')
            ->where('user_id', $targetUser->id)
            ->where(function ($q) use ($viewerId) {
                $q->where('is_public', true)
                    ->orWhereRaw('JSON_CONTAINS(shared_with, ?)', [json_encode($viewerId)]);
            })
            ->latest('date');

        if ($request->filled('date')) $query->forDate($request->date);

        return response()->json([
            'success' => true,
            'user' => ['id' => $targetUser->id, 'name' => $targetUser->name],
            'data' => $query->get(),
        ]);
    }

    private function checkCreatePermission(): void
    {
        if (!Auth::user()->can(Acl::PERMISSION_MANAGE_TRAINING) && !Auth::user()->can(Acl::PERMISSION_MANAGE_OWN_TRAINING)) {
            abort(403, 'Недостаточно прав для создания записи');
        }
    }

    private function authorizeUpdate(TrainingLog $log): void
    {
        $userId = Auth::id();
        if (Auth::user()->can(Acl::PERMISSION_MANAGE_TRAINING)) return;
        if ($log->user_id !== $userId) abort(403, 'Доступ запрещён: вы не владелец этой записи');
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
            'sets.*.notes' => 'nullable|string|max:255',
            'is_public' => 'nullable|boolean',
            'shared_with' => 'nullable|array|max:10',
            'shared_with.*' => 'integer|exists:users,id|distinct',
            'notes' => 'nullable|string|max:1000',
            'rating' => 'nullable|integer|min:1|max:5',
        ];
    }

    private function validateSharedWith(array &$data): void
    {
        $currentUserId = Auth::id();
        if (!empty($data['shared_with']) && in_array((int)$currentUserId, array_map('intval', $data['shared_with']))) {
            abort(422, json_encode(['shared_with' => ['Вы не можете поделиться записью с самим собой']]));
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
            if ($diff === 1) { $streak++; $current = $prev; }
            elseif ($diff > 1) break;
        }
        return $streak;
    }
}
