<?php

namespace App\Http\Controllers\Api;

use App\Models\Template;
use App\Models\ColumnTemplate;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
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
        try {
            $template = Template::with(['columns' => function($query) {
                $query->orderBy('order', 'asc');
            }])->findOrFail($id);

            return response()->json($this->formatTemplateResponse($template));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Шаблон не найден',
                'error' => 'TEMPLATE_NOT_FOUND'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Ошибка при загрузке шаблона: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ошибка при загрузке шаблона',
                'error' => 'SERVER_ERROR'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:templates,name',
            'columns' => 'required|array|min:1',
            'columns.*.type' => ['required', Rule::in(['text', 'number', 'select', 'date', 'datetime', 'boolean', 'reference'])],
            'columns.*.label' => 'required|string|max:255',
            'columns.*.options' => 'nullable|array',
            'columns.*.order' => 'nullable|integer|min:0',
            'columns.*.data_type' => 'nullable|string',
            'columns.*.unit' => 'nullable|string',
            'columns.*.reference' => 'nullable|array',
            'columns.*.boolean_settings' => 'nullable|array',
            'columns.*.date_format' => 'nullable|string'
        ]);

        $template = Template::create(['name' => $validated['name']]);

        foreach ($validated['columns'] as $index => $column) {
            $this->createOrUpdateColumn($template->id, null, $column);
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
            'columns.*.type' => ['sometimes', Rule::in(['text', 'number', 'select', 'date', 'datetime', 'boolean', 'reference'])],
            'columns.*.label' => 'sometimes|string|max:255',
            'columns.*.options' => 'nullable|array',
            'columns.*.order' => 'nullable|integer|min:0',
            'columns.*.id' => 'nullable|integer',
            'columns.*.data_type' => 'nullable|string',
            'columns.*.unit' => 'nullable|string',
            'columns.*.reference' => 'nullable|array',
            'columns.*.boolean_settings' => 'nullable|array',
            'columns.*.date_format' => 'nullable|string'
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
                $this->createOrUpdateColumn($template->id, $column['id'] ?? null, $column);
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
     * Создание или обновление колонки
     */
    private function createOrUpdateColumn($templateId, $columnId, $columnData)
    {
        $commonData = [
            'template_id' => $templateId,
            'type' => $columnData['type'],
            'label' => $columnData['label'],
            'order' => $columnData['order'] ?? 0,
            'data_type' => null,
            'unit' => null,
            'options' => null,
            'date_format' => null,
            'reference' => null,
            'boolean_settings' => null
        ];

        // Добавляем специфичные данные для каждого типа
        switch ($columnData['type']) {
            case 'text':
                $commonData['data_type'] = $columnData['data_type'] ?? $columnData['dataType'] ?? 'string';
                break;

            case 'number':
                $commonData['unit'] = $columnData['unit'] ?? null;
                break;

            case 'select':
                // Важно: клиент отправляет массив, поэтому сохраняем его как JSON
                $options = $columnData['options'] ?? [];
                $commonData['options'] = json_encode($options);
                break;

            case 'date':
            case 'datetime':
                $commonData['date_format'] = $columnData['date_format'] ?? $columnData['dateFormat'] ??
                    ($columnData['type'] === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
                break;

            case 'boolean':
                // Сохраняем как JSON
                $booleanSettings = $columnData['boolean_settings'] ?? $columnData['booleanSettings'] ?? [
                        'displayType' => 'toggle',
                        'trueLabel' => 'Да',
                        'falseLabel' => 'Нет'
                    ];
                $commonData['boolean_settings'] = json_encode($booleanSettings);
                break;

            case 'reference':
                // Сохраняем как JSON
                $reference = $columnData['reference'] ?? [
                        'entityType' => 'accessory',
                        'displayFormat' => '{name}'
                    ];
                $commonData['reference'] = json_encode($reference);
                break;
        }

        if ($columnId) {
            // Обновляем существующую колонку
            $columnTemplate = ColumnTemplate::find($columnId);
            if ($columnTemplate) {
                $columnTemplate->update($commonData);
            }
        } else {
            // Создаем новую колонку
            ColumnTemplate::create($commonData);
        }
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
                    'options' => $this->parseOptions($column->options),
                    'order' => $column->order,
                    'data_type' => $column->data_type,
                    'unit' => $column->unit,
                    'reference' => $this->parseReferenceData($column->reference),
                    'booleanSettings' => $this->parseBooleanSettings($column->boolean_settings),
                    'dateFormat' => $column->date_format ?? ($column->type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD')
                ];
            })
        ];
    }

    /**
     * Парсит опции колонки, обеспечивая, что они всегда возвращаются как массив
     */
    private function parseOptions($options)
    {
        if (is_null($options)) {
            return [];
        }

        if (is_array($options)) {
            return $options;
        }

        if (is_string($options)) {
            $decoded = json_decode($options, true);
            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    /**
     * Парсит данные справочника
     */
    private function parseReferenceData($referenceData)
    {
        if (is_null($referenceData)) {
            return [
                'entityType' => 'accessory',
                'displayFormat' => '{name}'
            ];
        }

        // Если это строка, пытаемся декодировать
        if (is_string($referenceData)) {
            $decoded = json_decode($referenceData, true);
            if (is_array($decoded)) {
                return [
                    'entityType' => $decoded['entityType'] ?? 'accessory',
                    'displayFormat' => $decoded['displayFormat'] ?? '{name}'
                ];
            }
        }

        // Если это уже массив
        if (is_array($referenceData)) {
            return [
                'entityType' => $referenceData['entityType'] ?? 'accessory',
                'displayFormat' => $referenceData['displayFormat'] ?? '{name}'
            ];
        }

        return [
            'entityType' => 'accessory',
            'displayFormat' => '{name}'
        ];
    }

    /**
     * Парсит настройки булевых значений
     */
    private function parseBooleanSettings($booleanSettings)
    {
        if (is_null($booleanSettings)) {
            return [
                'displayType' => 'toggle',
                'trueLabel' => 'Да',
                'falseLabel' => 'Нет'
            ];
        }

        // Если это строка, пытаемся декодировать
        if (is_string($booleanSettings)) {
            $decoded = json_decode($booleanSettings, true);
            if (is_array($decoded)) {
                return [
                    'displayType' => $decoded['displayType'] ?? 'toggle',
                    'trueLabel' => $decoded['trueLabel'] ?? 'Да',
                    'falseLabel' => $decoded['falseLabel'] ?? 'Нет'
                ];
            }
        }

        // Если это уже массив
        if (is_array($booleanSettings)) {
            return [
                'displayType' => $booleanSettings['displayType'] ?? 'toggle',
                'trueLabel' => $booleanSettings['trueLabel'] ?? 'Да',
                'falseLabel' => $booleanSettings['falseLabel'] ?? 'Нет'
            ];
        }

        return [
            'displayType' => 'toggle',
            'trueLabel' => 'Да',
            'falseLabel' => 'Нет'
        ];
    }
}
