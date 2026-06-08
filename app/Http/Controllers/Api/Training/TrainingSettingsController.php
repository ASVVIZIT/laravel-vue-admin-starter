<?php
namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Services\Training\TrainingSettingsService;
use App\Models\Acl;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TrainingSettingsController extends Controller
{
    // ❌ КОНСТАНТЫ УДАЛЕНЫ. Используем только сервис.

    public function __construct(private TrainingSettingsService $settings) {}

    public function index(Request $request): JsonResponse {
        if (!Auth::user()->can(Acl::PERMISSION_VIEW_TRAINING)) return response()->json(['success' => false, 'message' => 'Доступ запрещён'], 403);

        $tab = $request->get('tab', 'mine');
        return response()->json([
            'success' => true,
            'data' => [
                'server'   => $this->settings->getAllGrouped()['server'],
                'frontend' => $this->settings->getAllGrouped()['frontend'],
                'grouping' => $this->settings->resolveGroupingMode(Auth::id(), $tab),
                'columns'  => $this->settings->getColumnsConfig(),
                'limits'   => $this->settings->getLimits(),
            ]
        ]);
    }

    public function update(Request $request): JsonResponse {
        if (!Auth::user()->can(Acl::PERMISSION_MANAGE_TRAINING)) return response()->json(['success' => false, 'message' => 'Недостаточно прав'], 403);

        $data = $request->validate([
            'server.grouping_mode' => 'sometimes|in:auto,frontend,server',
            'server.grouping_auto_threshold' => 'sometimes|integer|min:50|max:10000',
            'server.grouping_by' => 'sometimes|in:user,exercise,date',
            'server.grouping_per_page' => 'sometimes|integer|min:5|max:50',
            'server.logs_per_page' => 'sometimes|integer|min:10|max:200',
            'server.enable_stats' => 'sometimes|boolean',
            'server.enable_sharing' => 'sometimes|boolean',
            'server.enable_min_groups_check' => 'sometimes|boolean',
            'server.grouping_min_groups' => 'sometimes|integer|min:1|max:100',

            'server.form_meta' => 'sometimes|array',
            'server.form_meta.layout' => 'sometimes|in:horizontal,vertical',
            'server.form_meta.visible_tabs' => 'sometimes|array',
            'server.form_meta.visible_tabs.*' => 'string|in:interface,search,display,grouping',
            'server.form_meta.tabs_order' => 'sometimes|array',
            'server.form_meta.tabs_order.*' => 'string|in:interface,search,display,grouping',

            'frontend.default_tab' => 'sometimes|in:mine,shared-with-me,shared-by-me',
            'frontend.show_grouping_toggle' => 'sometimes|boolean',
            'frontend.filters_collapsed_mobile' => 'sometimes|boolean',
            'frontend.compact_view' => 'sometimes|boolean',

            // 🔥 Консистентный префикс frontend.columns
            'frontend.columns' => 'sometimes|array',
            'frontend.columns.mine' => 'sometimes|array',
            'frontend.columns.mine.*' => 'boolean',
            'frontend.columns.shared-with-me' => 'sometimes|array',
            'frontend.columns.shared-with-me.*' => 'boolean',
            'frontend.columns.shared-by-me' => 'sometimes|array',
            'frontend.columns.shared-by-me.*' => 'boolean',

            'limits' => 'sometimes|array',
            'limits.max_shared_with' => 'sometimes|integer|min:1|max:500',
            'limits.search_results_limit' => 'sometimes|integer|min:10|max:500',
            'limits.max_sets' => 'sometimes|integer|min:1|max:200',
            'limits.max_notes_length' => 'sometimes|integer|min:50|max:5000',
            'limits.search_min_length' => 'sometimes|integer|min:1|max:10',
        ]);

        $flatSettings = [];
        foreach ($data as $group => $values) {
            if (!is_array($values)) continue;

            // Раскладываем frontend.columns в плоские ключи
            if ($group === 'frontend' && isset($values['columns'])) {
                foreach ($values['columns'] as $tab => $cols) {
                    $flatSettings["frontend.columns.{$tab}"] = json_encode($cols);
                }
                unset($values['columns']);
            }

            foreach ($values as $key => $value) {
                $flatSettings["{$group}.{$key}"] = is_array($value) ? json_encode($value) : (is_bool($value) ? ($value ? 'true' : 'false') : (string)$value);
            }
        }

        $this->settings->setMany($flatSettings);

        return response()->json([
            'success' => true,
            'message' => 'Настройки сохранены',
            'data' => [
                'server'   => $this->settings->getAllGrouped()['server'],
                'frontend' => $this->settings->getAllGrouped()['frontend'],
                'columns'  => $this->settings->getColumnsConfig(),
                'limits'   => $this->settings->getLimits(),
            ]
        ]);
    }
}
