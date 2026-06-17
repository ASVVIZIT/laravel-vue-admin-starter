<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\TableRow;
use App\Models\Template;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TableRowController extends Controller
{
    /**
     * Получение строк таблицы с пагинацией
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'required|integer|exists:templates,id',
            'parent_id' => 'nullable|integer|exists:table_rows,id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100'
        ]);

        try {
            $template = Template::with('columns')->findOrFail($validated['template_id']);

            // Проверяем, принадлежит ли parent_id тому же шаблону
            if (!empty($validated['parent_id'])) {
                $parentRow = TableRow::where('id', $validated['parent_id'])
                    ->where('template_id', $validated['template_id'])
                    ->first();

                if (!$parentRow) {
                    return response()->json([
                        'message' => 'Родительская строка не принадлежит указанному шаблону',
                        'error' => 'PARENT_ROW_MISMATCH'
                    ], 400);
                }
            }

            // Получаем данные таблицы
            $query = TableRow::where('template_id', $validated['template_id']);

            // Фильтр по родительской строке
            if (!empty($validated['parent_id'])) {
                $query->where('parent_id', $validated['parent_id']);
            }

            // Пагинация
            $perPage = $validated['per_page'] ?? 20;
            $page = $validated['page'] ?? 1;

            $rows = $query->orderBy('order')
                ->paginate($perPage, ['*'], 'page', $page);

            // Форматируем данные для клиента
            $formattedRows = $rows->map(function ($row) {
                return [
                    'id' => $row->id,
                    'template_id' => $row->template_id,
                    'parent_id' => $row->parent_id,
                    'data' => $row->data,
                    'order' => $row->order,
                    'has_children' => $row->children()->exists(),
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at
                ];
            });

            return response()->json([
                'data' => $formattedRows,
                'meta' => [
                    'current_page' => $rows->currentPage(),
                    'per_page' => $rows->perPage(),
                    'total' => $rows->total(),
                    'last_page' => $rows->lastPage()
                ]
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Шаблон не найден',
                'error' => 'TEMPLATE_NOT_FOUND'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors(),
                'error' => 'VALIDATION_ERROR'
            ], 422);
        } catch (\Exception $e) {
            Log::error('TableRowController index error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Внутренняя ошибка сервера',
                'error' => 'SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Создание новой строки
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'required|integer|exists:templates,id',
            'parent_id' => 'nullable|integer|exists:table_rows,id',
            'data' => 'required|array',
            'order' => 'nullable|integer|min:0'
        ], [
            'data.required' => 'Данные строки обязательны для заполнения.'
        ]);

        try {
            $template = Template::with('columns')->findOrFail($validated['template_id']);

            // Проверяем соответствие данных структуре шаблона
            $validationErrors = $this->validateRowData($validated['data'], $template);

            if (!empty($validationErrors)) {
                return response()->json([
                    'message' => 'Ошибка валидации данных',
                    'errors' => $validationErrors,
                    'error' => 'DATA_VALIDATION_ERROR'
                ], 422);
            }

            // Определяем порядок, если не указан
            if (!isset($validated['order'])) {
                $validated['order'] = $validated['parent_id']
                    ? TableRow::where('parent_id', $validated['parent_id'])->max('order') + 1
                    : TableRow::where('template_id', $validated['template_id'])
                        ->whereNull('parent_id')
                        ->max('order') + 1;
            }

            $this->row = TableRow::create([
                'template_id' => $validated['template_id'],
                'parent_id' => $validated['parent_id'] ?? null,
                'data' => $validated['data'],
                'order' => $validated['order']
            ]);

            return response()->json($this->formatRow($this->row, $template), 201);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Шаблон не найден',
                'error' => 'TEMPLATE_NOT_FOUND'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors(),
                'error' => 'VALIDATION_ERROR'
            ], 422);
        } catch (\Exception $e) {
            Log::error('TableRowController store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Внутренняя ошибка сервера',
                'error' => 'SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Валидация данных строки
     */
    private function validateRowData(array $data, Template $template): array
    {
        $errors = [];

        foreach ($template->columns as $column) {
            $label = $column->label;

            // Проверяем наличие обязательных полей
            if (!array_key_exists($label, $data)) {
                $errors[$label][] = 'Поле обязательно для заполнения';
                continue;
            }

            // Проверяем тип данных
            switch ($column->type) {
                case 'number':
                    if (!is_numeric($data[$label])) {
                        $errors[$label][] = 'Должно быть числом';
                    }
                    break;

                case 'select':
                    $options = json_decode($column->options, true) ?: [];
                    if (!in_array($data[$label], $options)) {
                        $errors[$label][] = 'Недопустимое значение';
                    }
                    break;

                case 'boolean':
                    if (!is_bool($data[$label])) {
                        $errors[$label][] = 'Должно быть логическим значением';
                    }
                    break;

                case 'date':
                    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data[$label])) {
                        $errors[$label][] = 'Неверный формат даты (ожидается ГГГГ-ММ-ДД)';
                    }
                    break;
            }
        }

        return $errors;
    }

    /**
     * Форматирование строки для ответа
     */
    private function formatRow(TableRow $row, Template $template)
    {
        return [
            'id' => $row->id,
            'template_id' => $row->template_id,
            'parent_id' => $row->parent_id,
            'data' => $row->data,
            'order' => $row->order,
            'has_children' => $row->children()->exists(),
            'columns' => $template->columns->map(function ($column) {
                return [
                    'id' => $column->id,
                    'label' => $column->label,
                    'type' => $column->type,
                    'options' => $column->options ? json_decode($column->options, true) : [],
                    'reference' => $column->reference ? json_decode($column->reference, true) : null,
                    'boolean_settings' => $column->boolean_settings ? json_decode($column->boolean_settings, true) : null,
                    'date_format' => $column->date_format
                ];
            }),
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at
        ];
    }
}
