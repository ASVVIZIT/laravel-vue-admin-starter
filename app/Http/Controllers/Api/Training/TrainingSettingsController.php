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

            // 🔥 НОВЫЕ ПРАВИЛА ВАЛИДАЦИИ
            'server.enable_min_groups_check' => 'sometimes|boolean',
            'server.grouping_min_groups' => 'sometimes|integer|min:1|max:100',

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
                    $fullKey = "{$group}.{$key}";
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

    private function normalizeValue($value)
    {
        if (is_array($value)) return json_encode($value);
        if (is_bool($value)) return $value ? 'true' : 'false';
        if (is_int($value) || is_float($value)) return (string)$value;
        if (is_string($value)) {
            $lower = strtolower(trim($value));
            if (in_array($lower, ['true', '1'], true)) return 'true';
            if (in_array($lower, ['false', '0', ''], true)) return 'false';
            return $value;
        }
        return (string)$value;
    }
}
