<?php
// app/Http/Controllers/Api/ReferenceController.php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReferenceController extends Controller
{
    /**
     * Получение списка типов справочников
     * (Этот метод остается как есть)
     */
    public function getTypes()
    {
        return response()->json([
            'data' => [
                ['value' => 'accessory', 'label' => 'Аксессуары'],
                ['value' => 'brand', 'label' => 'Бренды'],
                ['value' => 'device_type', 'label' => 'Типы устройств']
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
            $className = Str::studly($modelName);

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
            // Используем with() для eager loading отношений, если они определены в модели
            // Например, в Accessory есть with(['brand', 'type', ...])
            // Для простоты предположим, что у всех моделей есть метод scopeWithRelations()
            // или мы можем определить отношения динамически

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
                // Это может быть сложнее в реальном приложении,
                // но для начала можно использовать whereHas или where для основных полей
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

                    // Добавляем поиск по отношениям, если они определены
                    // Это требует дополнительной логики для определения отношений
                    // Пока оставим как есть
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
}
