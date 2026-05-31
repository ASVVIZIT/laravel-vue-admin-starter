<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\Training\Exercise;
use App\Models\Acl;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Контроллер справочника упражнений
 *
 * Архитектура: аналогично SmartLight модулю
 * - Публичные методы: index (справочник доступен всем аутентифицированным)
 * - Приватные методы: нет (управление упражнениями — только через админку)
 * - Middleware: auth:sanctum (на уровне роутов)
 */
class ExerciseController extends Controller
{
    /**
     * GET /api/training/exercises
     *
     * Возвращает список активных упражнений для формы добавления тренировки.
     * Доступно всем аутентифицированным пользователям с правом view training.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Проверка базового права на доступ к модулю
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещён',
                'error' => 'permission_denied'
            ], 403);
        }

        // Поиск по названию (опционально)
        $query = Exercise::active()->orderBy('type')->orderBy('name');

        if ($request->filled('search')) {
            $query->search($request->search);
        }
        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        $exercises = $query->get(['id', 'name', 'type', 'default_unit', 'is_active']);

        return response()->json([
            'success' => true,
            'data' => $exercises,
            'meta' => [
                'count' => $exercises->count(),
                'types' => $exercises->groupBy('type')->keys()->values()
            ]
        ]);
    }
}
