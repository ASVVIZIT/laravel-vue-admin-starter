<?php
// app/Http/Controllers/Api/TableRowController.php

namespace App\Http\Controllers\Api;

use App\Models\Template;
use App\Models\ColumnTemplate;
use App\Models\TableRow;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

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
                    ->where('template_id', $template->id)
                    ->first();

                if (!$parentRow) {
                    return response()->json([
                        'message' => 'Родительская строка не принадлежит указанному шаблону',
                        'error' => 'INVALID_PARENT'
                    ], 400);
                }
            }

            // Загружаем только верхний уровень, если не указан parent_id
            $query = TableRow::where('template_id', $template->id);

            if (!empty($validated['parent_id'])) {
                $query->where('parent_id', $validated['parent_id']);
            } else {
                $query->whereNull('parent_id');
            }

            $paginated = $query->orderBy('order', 'asc')->paginate($validated['per_page'] ?? 25);

            return response()->json([
                'data' => $this->formatRows($paginated->items(), $template),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage()
                ]
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Шаблон не найден',
                'error' => 'TEMPLATE_NOT_FOUND'
            ], 404);
        }
    }

    /**
     * Получение конкретной строки
     */
    public function show($id)
    {
        try {
            $row = TableRow::with('children')->findOrFail($id);
            $template = Template::with('columns')->findOrFail($row->template_id);

            return response()->json($this->formatRow($row, $template));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Строка не найдена',
                'error' => 'ROW_NOT_FOUND'
            ], 404);
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
                    'error' => 'VALIDATION_ERROR'
                ], 422);
            }

            // Проверяем, что родительская строка принадлежит тому же шаблону
            if (!empty($validated['parent_id'])) {
                $parentRow = TableRow::where('id', $validated['parent_id'])
                    ->where('template_id', $template->id)
                    ->first();

                if (!$parentRow) {
                    return response()->json([
                        'message' => 'Родительская строка не принадлежит указанному шаблону',
                        'error' => 'INVALID_PARENT'
                    ], 400);
                }
            }

            DB::transaction(function () use ($validated, $template) {
                $validated['order'] = $validated['order'] ?? (TableRow::where('parent_id', $validated['parent_id'])->max('order') ?? -1) + 1;

                $this->row = TableRow::create([
                    'template_id' => $validated['template_id'],
                    'parent_id' => $validated['parent_id'] ?? null,
                    'data' => $validated['data'],
                    'order' => $validated['order']
                ]);
            });

            return response()->json($this->formatRow($this->row, $template), 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Шаблон не найден',
                'error' => 'TEMPLATE_NOT_FOUND'
            ], 404);
        }
    }

    /**
     * Обновление строки
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'data' => 'required|array',
            'order' => 'nullable|integer|min:0'
        ], [
            'data.required' => 'Данные строки обязательны для заполнения.'
        ]);

        try {
            $row = TableRow::findOrFail($id);
            $template = Template::with('columns')->findOrFail($row->template_id);

            // Проверяем соответствие данных структуре шаблона
            $validationErrors = $this->validateRowData($validated['data'], $template);
            if (!empty($validationErrors)) {
                return response()->json([
                    'message' => 'Ошибка валидации данных',
                    'errors' => $validationErrors,
                    'error' => 'VALIDATION_ERROR'
                ], 422);
            }

            DB::transaction(function () use ($row, $validated) {
                $row->update([
                    'data' => $validated['data'],
                    'order' => $validated['order'] ?? $row->order
                ]);
            });

            return response()->json($this->formatRow($row, $template));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Строка не найдена',
                'error' => 'ROW_NOT_FOUND'
            ], 404);
        }
    }

    /**
     * Удаление строки
     */
    public function destroy($id)
    {
        try {
            $row = TableRow::findOrFail($id);

            DB::transaction(function () use ($row) {
                // Сначала удаляем дочерние строки
                $row->children()->delete();

                // Затем удаляем саму строку
                $row->delete();
            });

            return response()->json(null, 204);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Строка не найдена',
                'error' => 'ROW_NOT_FOUND'
            ], 404);
        }
    }

    /**
     * Валидация данных строки по шаблону
     */
    private function validateRowData(array $data, Template $template): array
    {
        $errors = [];
        $columns = $template->columns->keyBy('label');

        foreach ($data as $key => $value) {
            // Ищем колонку по метке (label)
            $column = $columns->first(function ($col) use ($key) {
                return $col->label === $key;
            });

            if (!$column) {
                $errors[$key][] = 'Неизвестная колонка';
                continue;
            }

            switch ($column->type) {
                case 'number':
                    if (!is_numeric($value) && $value !== null) {
                        $errors[$key][] = 'Должно быть числом';
                    }
                    break;

                case 'boolean':
                    // Убедитесь, что проверка учитывает все возможные представления булевых значений
                    $validBooleanValues = [true, false, 1, 0, 'true', 'false', '1', '0', null];
                    if (!in_array($value, $validBooleanValues, true)) {
                        $errors[$key][] = 'Должно быть булевым значением';
                    }
                    break;

                case 'date':
                    // Простая проверка формата даты
                    $formats = [
                        'YYYY-MM-DD' => 'Y-m-d',
                        'DD.MM.YYYY' => 'd.m.Y',
                        'MM/DD/YYYY' => 'm/d/Y',
                        'DD MMM YYYY' => 'd M Y',
                        'YYYY/MM/DD' => 'Y/m/d',
                        'DD-MM-YYYY' => 'd-m-Y'
                    ];

                    $dateFormat = $column->date_format ?? 'YYYY-MM-DD';
                    $phpFormat = $formats[$dateFormat] ?? 'Y-m-d';

                    // Если значение уже отформатировано как объект, извлекаем строковое значение
                    if (is_array($value) && isset($value['value'])) {
                        $value = $value['value'];
                    }

                    // Если значение - объект, пытаемся получить строковое представление
                    if (is_object($value) && method_exists($value, '__toString')) {
                        $value = (string)$value;
                    }

                    // Если значение - объект с полем 'value', используем его
                    if (is_object($value) && isset($value->value)) {
                        $value = $value->value;
                    }

                    $d = \DateTime::createFromFormat($phpFormat, $value);
                    if (!$d || $d->format($phpFormat) !== $value) {
                        $errors[$key][] = "Неверный формат даты. Ожидается формат: {$dateFormat}";
                    }
                    break;

                case 'select':
                    // Убедитесь, что проверка учитывает null
                    if ($value !== null && !in_array($value, $column->options, true)) {
                        $optionsList = implode(', ', $column->options);
                        $errors[$key][] = "Недопустимое значение для выбора. Допустимые значения: {$optionsList}";
                    }
                    break;

                case 'reference':
                    // Убедитесь, что проверка учитывает null
                    if ($value !== null && !is_numeric($value)) {
                        // Проверяем, может ли это быть объект с полем id
                        if (is_array($value) && isset($value['id']) && is_numeric($value['id'])) {
                            // Допустимо, пропускаем
                        } else if (is_object($value) && isset($value->id) && is_numeric($value->id)) {
                            // Допустимо, пропускаем
                        } else {
                            $errors[$key][] = 'Должно быть числом (ID справочника)';
                        }
                    }
                    break;
            }
        }

        return $errors;
    }

    /**
     * Форматирование строк для ответа
     */
    private function formatRows(array $rows, Template $template): array
    {
        return array_map(function ($row) use ($template) {
            return $this->formatRow($row, $template);
        }, $rows);
    }

    /**
     * Форматирование одной строки для ответа
     */
    private function formatRow($row, Template $template): array
    {
        // Исправление: проверяем, является ли $row объектом
        $formatted = is_object($row) ? $row->toArray() : $row;

        // Добавляем информацию о шаблоне
        $formatted['template'] = [
            'id' => $template->id,
            'name' => $template->name
        ];

        // Форматируем данные в соответствии с типами колонок
        $formatted['data'] = $this->formatRowData($formatted['data'] ?? [], $template);

        // Добавляем информацию о дочерних элементах
        if (isset($formatted['children'])) {
            $formatted['children'] = $this->formatRows($formatted['children'], $template);
        }

        return $formatted;
    }

    /**
     * Форматирование данных строки
     */
    private function formatRowData(array $data, Template $template): array
    {
        $formattedData = [];
        $columns = $template->columns->keyBy('label');

        foreach ($data as $key => $value) {
            $column = $columns->get($key);

            if (!$column) {
                $formattedData[$key] = $value;
                continue;
            }

            // Исправление: проверяем, является ли $column объектом
            $columnData = is_object($column) ? $column->toArray() : $column;

            // Убедимся, что у колонки есть необходимая структура
            if ($column->type === 'reference' && empty($columnData['reference'])) {
                $columnData['reference'] = [
                    'entityType' => 'accessory',
                    'displayFormat' => '{name}'
                ];
            } elseif ($column->type === 'boolean' && empty($columnData['booleanSettings'])) {
                $columnData['booleanSettings'] = [
                    'displayType' => 'toggle',
                    'trueLabel' => 'Да',
                    'falseLabel' => 'Нет'
                ];
            } elseif ($column->type === 'date' && empty($columnData['dateFormat'])) {
                $columnData['dateFormat'] = 'YYYY-MM-DD';
            }

            $formattedData[$key] = $this->formatValue($value, $columnData);
        }

        return $formattedData;
    }

    /**
     * Форматирование значения в зависимости от типа колонки
     */
    private function formatValue($value, $column)
    {
        if ($value === null) {
            return [
                'value' => null,
                'display' => '—'
            ];
        }

        $type = $column['type'] ?? null;

        switch ($type) {
            case 'boolean':
                return $this->formatBooleanValue($value, $column);

            case 'date':
                return $this->formatDateValue($value, $column);

            case 'reference':
                return $this->formatReferenceValue($value, $column);

            case 'select':
                return $this->formatSelectValue($value, $column);

            default:
                return [
                    'value' => $value,
                    'display' => $value
                ];
        }
    }

    /**
     * Форматирование булева значения
     */
    private function formatBooleanValue($value, $column)
    {
        $parsedValue = $this->parseBooleanValue($value);

        $settings = json_decode($column['booleanSettings'] ?? '{}', true) ?? [
                'displayType' => 'toggle',
                'trueLabel' => 'Да',
                'falseLabel' => 'Нет'
            ];

        return [
            'value' => $parsedValue,
            'display' => $parsedValue ?
                ($settings['trueLabel'] ?? 'Да') :
                ($settings['falseLabel'] ?? 'Нет')
        ];
    }

    /**
     * Парсинг булевых значений из разных форматов
     */
    private function parseBooleanValue($value)
    {
        $trueValues = [true, 1, 'true', '1', 'yes', 'да'];
        $falseValues = [false, 0, 'false', '0', 'no', 'нет', null, 'null', ''];

        if (in_array($value, $trueValues, true) ||
            (is_string($value) && in_array(strtolower($value), $trueValues))) {
            return true;
        } elseif (in_array($value, $falseValues, true) ||
            (is_string($value) && in_array(strtolower($value), $falseValues))) {
            return false;
        }

        return null;
    }

    /**
     * Форматирование даты
     */
    private function formatDateValue($value, $column)
    {
        $format = $column['dateFormat'] ?? 'YYYY-MM-DD';

        // Если значение уже отформатировано, возвращаем его
        if (is_array($value) && isset($value['value']) && isset($value['display'])) {
            return $value;
        }

        return [
            'value' => $this->parseDateValue($value),
            'display' => $this->formatDateForDisplay($value, $format)
        ];
    }

    /**
     * Парсинг значения даты
     */
    private function parseDateValue($value)
    {
        if (empty($value)) return null;

        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Форматирование даты для отображения
     */
    private function formatDateForDisplay($value, $format)
    {
        if (empty($value)) return '';

        $formats = [
            'YYYY-MM-DD' => 'Y-m-d',
            'DD.MM.YYYY' => 'd.m.Y',
            'MM/DD/YYYY' => 'm/d/Y',
            'DD MMM YYYY' => 'd M Y',
            'YYYY/MM/DD' => 'Y/m/d',
            'DD-MM-YYYY' => 'd-m-Y'
        ];

        $phpFormat = $formats[$format] ?? 'Y-m-d';

        try {
            return \Carbon\Carbon::parse($value)->format($phpFormat);
        } catch (\Exception $e) {
            return $value;
        }
    }

    /**
     * Форматирование значения справочника
     */
    private function formatReferenceValue($value, $column)
    {
        // Если значение уже отформатировано, возвращаем его
        if (is_array($value) && isset($value['id']) && isset($value['display'])) {
            return $value;
        }

        // Если значение - число, это ID элемента справочника
        if (is_numeric($value)) {
            return [
                'id' => (int)$value,
                'display' => $this->getFormattedReferenceDisplay((int)$value, $column)
            ];
        }

        // Если значение - строка, пытаемся преобразовать в число
        if (is_string($value) && is_numeric($value)) {
            return [
                'id' => (int)$value,
                'display' => $this->getFormattedReferenceDisplay((int)$value, $column)
            ];
        }

        // Если значение не определено
        return [
            'id' => null,
            'display' => '—'
        ];
    }

    /**
     * Получение отформатированного отображения для справочника
     */
    private function getFormattedReferenceDisplay($id, $column)
    {
        // В реальном приложении здесь будет запрос к API справочника
        // Для примера возвращаем заглушку
        return "Элемент справочника #{$id}";
    }

    /**
     * Форматирование значения для типа select
     */
    private function formatSelectValue($value, $column)
    {
        $options = $column['options'] ?? [];

        return [
            'value' => $value,
            'display' => in_array($value, $options) ? $value : 'Недопустимое значение'
        ];
    }
}
