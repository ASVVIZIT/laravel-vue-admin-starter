<?php
// app/Http/Controllers/Api/ReferenceController.php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File; // Для сканирования директории
use ReflectionClass; // Для рефлексии

class ReferenceController extends Controller
{
    /**
     * Получение списка типов справочников
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTypes()
    {
        return response()->json([
            'data' => [
                ['value' => 'accessory', 'label' => 'Аксессуары'],
                ['value' => 'brand', 'label' => 'Бренды'],
                ['value' => 'device_type', 'label' => 'Типы устройств'],
                ['value' => 'measurement_category', 'label' => 'Категории измерений']
                // Добавьте другие типы справочников по мере необходимости
            ]
        ])->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * УНИВЕРСАЛЬНЫЙ метод для получения данных справочника по типу (модели)
     *
     * @param Request $request
     * @param string $modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @return \Illuminate\Http\JsonResponse
     */
    public function getData(Request $request, $modelName)
    {
        try {
            // 1. Преобразуем snake_case в PascalCase для поиска класса модели
            // Например, 'device_type' -> 'DeviceType'
            $className = Str::studly(str_replace('-', '_', $modelName)); // Поддержка kebab-case

            // 2. Формируем полное имя класса модели
            // Предполагаем, что все модели справочников находятся в одном namespace
            // Например, App\Models\ElectricalProtection\
            $modelNamespace = 'App\\Models\\ElectricalProtection\\';
            $fullModelClass = $modelNamespace . $className;

            // 3. Проверяем, существует ли класс модели
            if (!class_exists($fullModelClass)) {
                return response()->json([
                    'error' => "Модель '{$fullModelClass}' не найдена"
                ], 404);
            }

            // 4. Создаем экземпляр запроса к модели
            // Попробуем вызвать scopeWithRelations, если он существует
            if (method_exists($fullModelClass, 'scopeWithRelations')) {
                $query = $fullModelClass::withRelations();
            } else {
                // Или просто получаем все записи без отношений
                $query = $fullModelClass::query();
            }

            // 5. Применяем фильтры из запроса
            if ($request->filled('search')) {
                $search = $request->search;
                // Применяем универсальный поиск по полям модели
                $query->where(function($q) use ($search, $fullModelClass) {
                    // Получаем fillable поля модели для поиска
                    $modelInstance = new $fullModelClass;
                    $fillableFields = $modelInstance->getFillable();

                    // Добавляем поиск по каждому fillable полю
                    foreach ($fillableFields as $field) {
                        // Исключаем некоторые служебные поля
                        if (!in_array($field, ['id', 'created_at', 'updated_at'])) {
                            $q->orWhere($field, 'LIKE', "%{$search}%");
                        }
                    }
                });
            }

            // 6. Обрабатываем режим для выпадающих списков
            if ($request->boolean('for_dropdown')) {
                // Возвращаем все записи
                return response()->json([
                    'data' => $query->get()
                ]);
            }

            // 7. Стандартный режим с пагинацией
            $perPage = $request->per_page ?? 10;
            $items = $query->paginate($perPage);

            return response()->json([
                'data' => $items->items(),
                'meta' => [
                    'total' => $items->total(),
                    'per_page' => $items->perPage(),
                    'current_page' => $items->currentPage(),
                    'last_page' => $items->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("ReferenceController getData error for model '{$modelName}': " . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при загрузке данных справочника',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получение информации о полях модели справочника
     *
     * @param string $modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFieldInfo($modelName)
    {
        try {
            // 1. Преобразуем snake_case в PascalCase для поиска класса модели
            $className = Str::studly(str_replace('-', '_', $modelName));

            // 2. Формируем полное имя класса модели
            $modelNamespace = 'App\\Models\\ElectricalProtection\\';
            $fullModelClass = $modelNamespace . $className;

            // 3. Проверяем, существует ли класс модели
            if (!class_exists($fullModelClass)) {
                return response()->json([
                    'error' => "Модель '{$fullModelClass}' не найдена"
                ], 404);
            }

            // 4. Получаем экземпляр модели
            $modelInstance = new $fullModelClass;

            // 5. Получаем fillable поля модели
            $fillableFields = $modelInstance->getFillable();

            // 6. Получаем отношения модели (если они определены)
            $relations = [];
            // Это требует дополнительной логики для определения отношений
            // Пока возвращаем пустой массив
            // TODO: Реализовать получение отношений через рефлексию или аннотации

            // 7. Формируем список доступных ключей
            $availableKeys = [];

            // Добавляем fillable поля
            foreach ($fillableFields as $field) {
                // Исключаем некоторые служебные поля
                if (!in_array($field, ['id', 'created_at', 'updated_at'])) {
                    $availableKeys[] = $field;
                }
            }

            // Добавляем отношения (если они определены)
            // Например, если у модели есть отношение 'brand', добавляем 'brand.name', 'brand.country' и т.д.
            // Это требует дополнительной логики для определения полей отношений
            // Пока возвращаем только fillable поля

            // 8. Возвращаем информацию о полях
            return response()->json([
                'data' => [
                    'modelName' => $modelName,
                    'className' => $className,
                    'fillable' => $fillableFields,
                    'relations' => $relations,
                    'availableKeys' => $availableKeys
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("ReferenceController getFieldInfo error for model '{$modelName}': " . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при получении информации о полях модели справочника',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получение информации о модели справочника (название, описание, поля с типами и т.д.)
     *
     * @param string $modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @return \Illuminate\Http\JsonResponse
     */
    public function getModelInfo($modelName)
    {
        try {
            // 1. Преобразуем snake_case в PascalCase для поиска класса модели
            $className = Str::studly(str_replace('-', '_', $modelName));

            // 2. Формируем полное имя класса модели
            $modelNamespace = 'App\\Models\\ElectricalProtection\\';
            $fullModelClass = $modelNamespace . $className;

            // 3. Проверяем, существует ли класс модели
            if (!class_exists($fullModelClass)) {
                return response()->json([
                    'error' => "Модель '{$fullModelClass}' не найдена"
                ], 404);
            }

            // 4. Получаем экземпляр модели
            $modelInstance = new $fullModelClass;

            // 5. Получаем информацию о модели через рефлексию
            $reflection = new ReflectionClass($fullModelClass);

            // 6. Получаем fillable поля модели
            $fillableFields = $modelInstance->getFillable();

            // 7. Получаем отношения модели (если они определены)
            $relations = [];
            // Это требует дополнительной логики для определения отношений
            // Пока возвращаем пустой массив
            // TODO: Реализовать получение отношений через рефлексию или аннотации

            // 8. Получаем комментарии к полям (если они есть)
            // Это требует дополнительной логики для парсинга docblock комментариев
            // Пока возвращаем пустой массив
            $fieldComments = [];

            // 9. Формируем полную информацию о модели
            $modelInfo = [
                'modelName' => $modelName,
                'className' => $className,
                'tableName' => $modelInstance->getTable(),
                'fillable' => $fillableFields,
                'relations' => $relations,
                'fieldComments' => $fieldComments,
                'availableKeys' => [], // Будет заполнено ниже
                'exampleFormat' => '{name}' // Формат по умолчанию
            ];

            // 10. Формируем список доступных ключей
            // Добавляем fillable поля
            foreach ($fillableFields as $field) {
                // Исключаем некоторые служебные поля
                if (!in_array($field, ['id', 'created_at', 'updated_at'])) {
                    $modelInfo['availableKeys'][] = $field;
                }
            }

            // 11. Добавляем отношения (если они определены)
            // Например, если у модели есть отношение 'brand', добавляем 'brand.name', 'brand.country' и т.д.
            // Это требует дополнительной логики для определения полей отношений
            // Пока возвращаем только fillable поля

            // 12. Определяем формат отображения по умолчанию
            // Если у модели есть поле 'name', используем его
            if (in_array('name', $fillableFields)) {
                $modelInfo['exampleFormat'] = '{name}';
            }
            // Если у модели есть поле 'label', используем его
            else if (in_array('label', $fillableFields)) {
                $modelInfo['exampleFormat'] = '{label}';
            }
            // Если у модели есть поле 'title', используем его
            else if (in_array('title', $fillableFields)) {
                $modelInfo['exampleFormat'] = '{title}';
            }
            // Если у модели есть поле 'model', используем его
            else if (in_array('model', $fillableFields)) {
                $modelInfo['exampleFormat'] = '{model}';
            }
            // Иначе используем первый доступный fillable ключ
            else if (count($modelInfo['availableKeys']) > 0) {
                $modelInfo['exampleFormat'] = '{' . $modelInfo['availableKeys'][0] . '}';
            }

            // 13. Возвращаем информацию о модели
            return response()->json([
                'data' => $modelInfo
            ]);

        } catch (\Exception $e) {
            Log::error("ReferenceController getModelInfo error for model '{$modelName}': " . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при получении информации о модели справочника',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
