<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Services\Training\TrainingSettingsService;
use App\Models\Acl;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TrainingSettingsController extends Controller
{
    public function __construct(private TrainingSettingsService $settings) {}

    public function index(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);
        }

        $tab = $request->get('tab', 'mine');
        $grouping = $this->settings->resolveGroupingMode(Auth::id(), $tab);
        $allSettings = $this->settings->getAllGrouped();

        return response()->json([
            'success' => true,
            'data' => [
                'server' => $allSettings['server'],
                'frontend' => $allSettings['frontend'],
                'grouping' => $grouping,
                'columns' => $this->settings->getColumnsConfig(),
            ]
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        if (!Auth::user()->can(Acl::PERMISSION_MANAGE_TRAINING)) {
            return response()->json(['success' => false, 'message' => 'Недостаточно прав'], 403);
        }

        $data = $request->validate([
            'server.grouping_mode' => 'sometimes|in:auto,frontend,server',
            'server.grouping_auto_threshold' => 'sometimes|integer|min:50|max:10000',
            'server.grouping_by' => 'sometimes|in:user,exercise,date',
            'server.grouping_per_page' => 'sometimes|integer|min:5|max:50',
            'server.logs_per_page' => 'sometimes|integer|min:10|max:200',

            'server.enable_stats' => 'sometimes|boolean',
            'server.enable_sharing' => 'sometimes|boolean',

            'frontend.default_tab' => 'sometimes|in:mine,shared-with-me,shared-by-me',
            'frontend.show_grouping_toggle' => 'sometimes|boolean',
            'frontend.filters_collapsed_mobile' => 'sometimes|boolean',
            'frontend.compact_view' => 'sometimes|boolean',

            'columns' => 'sometimes|array',
            'columns.mine' => 'sometimes|array',
            'columns.mine.*' => 'boolean',
            'columns.shared-with-me' => 'sometimes|array',
            'columns.shared-with-me.*' => 'boolean',
            'columns.shared-by-me' => 'sometimes|array',
            'columns.shared-by-me.*' => 'boolean',
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data as $group => $values) {
                if (!is_array($values)) continue;

                foreach ($values as $key => $value) {
                    // 🔥 ИСПРАВЛЕНИЕ: Если группа 'columns', добавляем префикс 'frontend.'
                    // чтобы ключи совпадали с сидером и логикой чтения (frontend.columns.mine)
                    $prefix = ($group === 'columns') ? 'frontend.columns.' : "{$group}.";
                    $fullKey = $prefix . $key;

                    $normalizedValue = $this->normalizeValue($value);
                    $this->settings->set($fullKey, $normalizedValue);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Настройки сохранены',
            'data' => [
                'server' => $this->settings->getAllGrouped()['server'],
                'frontend' => $this->settings->getAllGrouped()['frontend'],
                'columns' => $this->settings->getColumnsConfig(),
            ]
        ]);
    }

    /**
     * 🔥 УМНАЯ НОРМАЛИЗАЦИЯ: конвертирует любое значение в строку для БД
     *
     * Правила:
     * - array → JSON-строка
     * - bool → 'true' / 'false'
     * - int/float → строковое число
     * - строка-булево ('true','false','1','0') → 'true' / 'false'
     * - любая другая строка → как есть (например, 'auto', 'user', 'mine')
     */
    private function normalizeValue($value)
    {
        // 1. Массивы → JSON
        if (is_array($value)) {
            return json_encode($value);
        }

        // 2. Булевы → 'true' / 'false'
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        // 3. Числа → строка
        if (is_int($value) || is_float($value)) {
            return (string)$value;
        }

        // 4. Строки: проверяем, не булево ли это представление
        if (is_string($value)) {
            $lower = strtolower(trim($value));

            // Это булево представление?
            if (in_array($lower, ['true', '1'], true)) {
                return 'true';
            }
            if (in_array($lower, ['false', '0', ''], true)) {
                return 'false';
            }

            // Это обычная строка ('auto', 'user', 'mine' и т.д.) → оставляем как есть
            return $value;
        }

        // 5. Всё остальное → в строку
        return (string)$value;
    }
}
