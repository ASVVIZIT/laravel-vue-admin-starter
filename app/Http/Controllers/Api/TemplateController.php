<?php
// app/Http/Controllers/Api/TemplateController.php
namespace App\Http\Controllers\Api;

use App\Models\Template;
use App\Models\ColumnTemplate;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class TemplateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    public function index(Request $request)
    {
        $templates = Template::withCount('columns')
            ->when($request->has('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->search . '%');
            })
            ->orderBy('name')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $templates->items(),
            'meta' => [
                'current_page' => $templates->currentPage(),
                'per_page' => $templates->perPage(),
                'total' => $templates->total(),
                'last_page' => $templates->lastPage()
            ]
        ]);
    }

    public function show($id)
    {
        $template = Template::with(['columns' => function($query) {
            $query->orderBy('order', 'asc');
        }])->findOrFail($id);

        return response()->json([
            'id' => $template->id,
            'name' => $template->name,
            'columns' => $template->columns->map(function($column) {
                return [
                    'id' => $column->id,
                    'type' => $column->type,
                    'label' => $column->label,
                    'options' => $column->options ?? [],
                    'order' => $column->order,
                    'reference' => $column->reference ? json_decode($column->reference, true) : null,
                    'booleanSettings' => $column->boolean_settings ? json_decode($column->boolean_settings, true) : null,
                    'dateFormat' => $column->date_format
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:templates,name',
            'columns' => 'required|array|min:1',
            'columns.*.type' => ['required', Rule::in(['text', 'number', 'select', 'date', 'boolean', 'reference'])],
            'columns.*.label' => 'required|string|max:255',
            'columns.*.options' => 'nullable|array',
            'columns.*.order' => 'nullable|integer|min:0',
            'columns.*.reference' => 'nullable|array',
            'columns.*.booleanSettings' => 'nullable|array',
            'columns.*.dateFormat' => 'nullable|string'
        ]);

        $template = Template::create(['name' => $validated['name']]);

        foreach ($validated['columns'] as $index => $column) {
            ColumnTemplate::create([
                'template_id' => $template->id,
                'type' => $column['type'],
                'label' => $column['label'],
                'options' => $column['type'] === 'select' ? $column['options'] : null,
                'order' => $column['order'] ?? $index,
                'reference' => $column['type'] === 'reference' ? json_encode($column['reference']) : null,
                'boolean_settings' => in_array($column['type'], ['boolean']) ? json_encode($column['booleanSettings']) : null,
                'date_format' => in_array($column['type'], ['date']) ? $column['dateFormat'] : null
            ]);
        }

        return response()->json(
            $this->formatTemplateResponse(Template::with(['columns' => function($query) {
                $query->orderBy('order', 'asc');
            }])->findOrFail($template->id)),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:templates,name,' . $id,
            'columns' => 'sometimes|array',
            'columns.*.type' => ['sometimes', Rule::in(['text', 'number', 'select', 'date', 'boolean', 'reference'])],
            'columns.*.label' => 'sometimes|string|max:255',
            'columns.*.options' => 'nullable|array',
            'columns.*.order' => 'nullable|integer|min:0',
            'columns.*.id' => 'nullable|integer',
            'columns.*.reference' => 'nullable|array',
            'columns.*.booleanSettings' => 'nullable|array',
            'columns.*.dateFormat' => 'nullable|string'
        ]);

        $template = Template::findOrFail($id);

        if ($request->has('name')) {
            $template->update(['name' => $validated['name']]);
        }

        if ($request->has('columns')) {
            // Сохраняем ID существующих колонок для определения удаленных
            $existingColumnIds = $template->columns()->pluck('id')->toArray();
            $receivedColumnIds = array_filter(array_column($validated['columns'], 'id'));

            // Удаляем колонки, которые отсутствуют в запросе
            $columnsToDelete = array_diff($existingColumnIds, $receivedColumnIds);
            if (!empty($columnsToDelete)) {
                ColumnTemplate::whereIn('id', $columnsToDelete)->delete();
            }

            // Обновляем или создаем колонки
            foreach ($validated['columns'] as $index => $column) {
                if (isset($column['id']) && in_array($column['id'], $existingColumnIds)) {
                    // Обновляем существующую колонку
                    $columnTemplate = ColumnTemplate::find($column['id']);
                    if ($columnTemplate) {
                        $columnTemplate->update([
                            'type' => $column['type'],
                            'label' => $column['label'],
                            'options' => $column['type'] === 'select' ? $column['options'] : null,
                            'order' => $column['order'] ?? $index,
                            'reference' => $column['type'] === 'reference' ? json_encode($column['reference']) : null,
                            'boolean_settings' => in_array($column['type'], ['boolean']) ? json_encode($column['booleanSettings']) : null,
                            'date_format' => in_array($column['type'], ['date']) ? $column['dateFormat'] : null
                        ]);
                    }
                } else {
                    // Создаем новую колонку
                    ColumnTemplate::create([
                        'template_id' => $template->id,
                        'type' => $column['type'],
                        'label' => $column['label'],
                        'options' => $column['type'] === 'select' ? $column['options'] : null,
                        'order' => $column['order'] ?? $index,
                        'reference' => $column['type'] === 'reference' ? json_encode($column['reference']) : null,
                        'boolean_settings' => in_array($column['type'], ['boolean']) ? json_encode($column['booleanSettings']) : null,
                        'date_format' => in_array($column['type'], ['date']) ? $column['dateFormat'] : null
                    ]);
                }
            }
        }

        return response()->json($this->formatTemplateResponse(
            Template::with(['columns' => function($query) {
                $query->orderBy('order', 'asc');
            }])->findOrFail($id)
        ));
    }

    public function destroy($id)
    {
        $template = Template::findOrFail($id);
        $templateName = $template->name;

        // Сначала удаляем все связанные строки таблицы
        $template->rows()->delete();

        // Затем удаляем колонки шаблона
        $template->columns()->delete();

        // И сам шаблон
        $template->delete();

        return response()->json([
            'message' => "Шаблон '{$templateName}' успешно удален",
            'id' => $id
        ], 200);
    }

    /**
     * Форматирует ответ шаблона для соответствия клиентскому формату
     */
    private function formatTemplateResponse($template)
    {
        return [
            'id' => $template->id,
            'name' => $template->name,
            'columns' => $template->columns->map(function($column) {
                return [
                    'id' => $column->id,
                    'tempId' => $column->id,
                    'type' => $column->type,
                    'label' => $column->label,
                    'options' => $column->options ?? [],
                    'order' => $column->order,
                    'reference' => $column->reference ? json_decode($column->reference, true) : [
                        'entityType' => 'accessory',
                        'displayFormat' => '{name}'
                    ],
                    'booleanSettings' => $column->boolean_settings ? json_decode($column->boolean_settings, true) : [
                        'displayType' => 'toggle',
                        'trueLabel' => 'Да',
                        'falseLabel' => 'Нет'
                    ],
                    'dateFormat' => $column->date_format ?? 'YYYY-MM-DD'
                ];
            })
        ];
    }
}
