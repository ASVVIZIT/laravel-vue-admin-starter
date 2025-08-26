<?php
// app/Models/Reference.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use ReflectionClass;
use Exception;
use Throwable; // Для более широкого захвата ошибок

/**
 * Модель для управления информацией о справочниках (без таблицы в БД)
 * Предоставляет методы для получения структуры моделей и их данных
 */
class Reference extends Model
{
    // Модель без таблицы в БД
    protected $table = null;

    // Защита от записи
    protected $guarded = ['*'];

    // Карта известных моделей справочников
    private static $knownModels = [
        'accessory' => [
            'class' => 'App\\Models\\ElectricalProtection\\Accessory',
            'label' => 'Аксессуары'
        ],
        'brand' => [
            'class' => 'App\\Models\\ElectricalProtection\\Brand',
            'label' => 'Бренды'
        ],
        'device_type' => [
            'class' => 'App\\Models\\ElectricalProtection\\DeviceType',
            'label' => 'Типы устройств'
        ],
        'measurement_category' => [
            'class' => 'App\\Models\\ElectricalProtection\\MeasurementCategory',
            'label' => 'Категории измерений'
        ]
        // Добавьте другие модели по мере необходимости
    ];

    /**
     * Получение списка всех известных типов справочников
     *
     * @return array
     */
    public static function getKnownTypes()
    {
        $types = [];
        foreach (self::$knownModels as $key => $info) {
            $types[] = [
                'value' => $key,
                'label' => $info['label']
            ];
        }
        return $types;
    }

    /**
     * Получение полного имени класса модели по типу
     *
     * @param string $modelName - Тип модели (snake_case)
     * @return string|null
     */
    public static function getModelClass($modelName)
    {
        if (!$modelName) {
            return null;
        }
        $cleanModelName = str_replace(['/', '\\'], '', $modelName); // Убираем слэши для безопасности

        // Проверяем, существует ли ключ в массиве и есть ли у него 'class'
        if (isset(self::$knownModels[$cleanModelName]) && isset(self::$knownModels[$cleanModelName]['class'])) {
            return self::$knownModels[$cleanModelName]['class'];
        }

        return null;
    }

    /**
     * Получение метки типа модели
     *
     * @param string $modelName - Тип модели (snake_case)
     * @return string|null
     */
    public static function getModelLabel($modelName)
    {
        if (!$modelName) {
            return null;
        }
        $cleanModelName = str_replace(['/', '\\'], '', $modelName);

        // Проверяем, существует ли ключ в массиве и есть ли у него 'label'
        if (isset(self::$knownModels[$cleanModelName]) && isset(self::$knownModels[$cleanModelName]['label'])) {
            return self::$knownModels[$cleanModelName]['label'];
        }

        return $cleanModelName; // Возвращаем само имя, если метка не найдена
    }

    /**
     * Проверка, является ли модель известной
     *
     * @param string $modelName - Тип модели (snake_case)
     * @return bool
     */
    public static function isKnownModel($modelName)
    {
        if (!$modelName) {
            return false;
        }
        $cleanModelName = str_replace(['/', '\\'], '', $modelName);
        return isset(self::$knownModels[$cleanModelName]);
    }

    /**
     * УНИВЕРСАЛЬНЫЙ метод для получения данных справочника по типу (модели)
     *
     * @param string $modelName - Название модели в snake_case (например, 'accessory', 'brand')
     * @param array $params - Параметры запроса (search, for_dropdown, per_page)
     * @return array
     * @throws Exception
     */
    public static function getData($modelName, $params = [])
    {
        // 1. Очистка и валидация входных данных
        $cleanModelName = trim(str_replace(['/', '\\'], '', $modelName ?? ''));

        if (empty($cleanModelName)) {
            throw new Exception("Название модели не может быть пустым.");
        }

        if (!self::isKnownModel($cleanModelName)) {
            throw new Exception("Неизвестный тип справочника: {$cleanModelName}");
        }

        $modelClass = self::getModelClass($cleanModelName);
        if (!$modelClass || !class_exists($modelClass)) {
            throw new Exception("Класс модели '{$modelClass}' не найден для справочника '{$cleanModelName}'.");
        }

        try {
            // 2. Создаем экземпляр запроса к модели (Builder)
            $query = $modelClass::query();

            // 3. Применяем scopeWithRelations, если он существует
            // (Предполагается, что scopeWithRelations определен в самой модели $modelClass)
            if (method_exists($modelClass, 'scopeWithRelations')) {
                // $modelClass::withRelations() возвращает Builder, уже с примененным with()
                $query = $modelClass::withRelations();
            }

            // 4. Применяем фильтры из параметров
            if (!empty($params['search'])) {
                $search = $params['search'];
                $query->where(function($q) use ($search, $modelClass) {
                    // Получаем fillable поля модели для поиска
                    $modelInstance = new $modelClass; // Создаем временный экземпляр для получения fillable
                    $fillableFields = $modelInstance->getFillable();

                    // Добавляем поиск по каждому fillable полю
                    foreach ($fillableFields as $field) {
                        // Исключаем служебные поля
                        if (!in_array($field, ['id', 'created_at', 'updated_at'])) {
                            $q->orWhere($field, 'LIKE', "%{$search}%");
                        }
                    }
                });
            }

            // 5. Обрабатываем режим для выпадающих списков
            if (!empty($params['for_dropdown']) && $params['for_dropdown']) {
                // Возвращаем все данные без пагинации
                $data = $query->get();
                return [
                    'data' => $data,
                    'meta' => [
                        'total' => $data->count(),
                        'per_page' => $data->count(),
                        'current_page' => 1,
                        'last_page' => 1
                    ]
                ];
            }

            // 6. Стандартный режим с пагинацией
            $perPage = $params['per_page'] ?? 10;
            // Убедимся, что perPage в разумных пределах
            $perPage = max(1, min($perPage, 100));
            $items = $query->paginate($perPage);

            return [
                'data' => $items->items(),
                'meta' => [
                    'total' => $items->total(),
                    'per_page' => $items->perPage(),
                    'current_page' => $items->currentPage(),
                    'last_page' => $items->lastPage()
                ]
            ];

        } catch (Exception $e) {
            Log::error("Reference getData error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);
            throw new Exception("Ошибка при загрузке данных справочника '{$cleanModelName}': " . $e->getMessage(), 0, $e);
        } catch (\Error $e) { // Ловим фатальные ошибки PHP тоже
            Log::error("Reference getData fatal error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);
            throw new Exception("Критическая ошибка при загрузке данных справочника '{$cleanModelName}': " . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Получение информации о полях модели справочника
     *
     * @param string $modelName - Тип модели (snake_case)
     * @return array
     * @throws Exception
     */
    public static function getFieldInfo($modelName)
    {
        // 1. Очистка и валидация входных данных
        $cleanModelName = trim(str_replace(['/', '\\'], '', $modelName ?? ''));

        if (empty($cleanModelName)) {
            throw new Exception("Название модели не может быть пустым.");
        }

        if (!self::isKnownModel($cleanModelName)) {
            throw new Exception("Неизвестный тип справочника: {$cleanModelName}");
        }

        $modelClass = self::getModelClass($cleanModelName);
        if (!$modelClass) {
            throw new Exception("Класс модели не определен для справочника '{$cleanModelName}'.");
        }
        if (!class_exists($modelClass)) {
            throw new Exception("Класс модели '{$modelClass}' не найден.");
        }

        try {
            // 2. === КРИТИЧЕСКИ ВАЖНО: Создаем ЭКЗЕМПЛЯР МОДЕЛИ ===
            // Именно экземпляр нужен для получения информации о таблице, fillable и т.д.
            // $modelClass::query() возвращает Builder, а не экземпляр!
            $modelInstance = new $modelClass;

            // 3. Получаем информацию о модели и её структуре
            $tableName = $modelInstance->getTable();
            $fillableFields = $modelInstance->getFillable();

            // 4. Получаем информацию о схеме таблицы
            $tableColumns = [];
            $columnTypes = [];
            try {
                $tableColumns = Schema::getColumnListing($tableName);
                foreach ($tableColumns as $column) {
                    try {
                        // Schema::getColumnType может выбрасывать исключения для некоторых типов
                        $columnTypes[$column] = Schema::getColumnType($tableName, $column);
                    } catch (Exception $e) {
                        Log::warning("Could not get type for column {$column} in table {$tableName}: " . $e->getMessage());
                        $columnTypes[$column] = 'unknown';
                    }
                }
            } catch (Exception $e) {
                Log::warning("Could not get column listing for table {$tableName}: " . $e->getMessage());
                // Если не удалось получить список колонок, работаем с fillable
                $tableColumns = $fillableFields;
                $columnTypes = array_fill_keys($fillableFields, 'unknown');
            }

            // 5. Получаем отношения модели через рефлексию
            $relations = self::getModelRelations($modelInstance);

            // 6. Формируем список доступных ключей для форматирования
            $availableKeys = self::getAvailableKeys($modelInstance, $relations);

            // 7. Определяем формат отображения по умолчанию
            $defaultDisplayFormat = self::getDefaultDisplayFormat($availableKeys);

            // 8. Возвращаем структурированную информацию
            return [
                'modelName' => $cleanModelName,
                'className' => class_basename($modelClass),
                'tableName' => $tableName,
                'fillable' => $fillableFields,
                'relations' => $relations,
                'columnTypes' => $columnTypes,
                'availableKeys' => array_values(array_unique($availableKeys)), // Убедимся, что ключи уникальны
                'defaultDisplayFormat' => $defaultDisplayFormat
            ];

        } catch (Exception $e) {
            Log::error("Reference getFieldInfo error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);
            // Передаем оригинальное сообщение, чтобы оно могло быть обработано на фронтенде
            throw new Exception("Ошибка при получении информации о полях справочника '{$cleanModelName}': " . $e->getMessage(), 0, $e);
        } catch (\Error $e) { // Ловим фатальные ошибки PHP тоже
            Log::error("Reference getFieldInfo fatal error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);
            throw new Exception("Критическая ошибка при получении информации о полях справочника '{$cleanModelName}': " . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Получение отношений модели через рефлексию
     * (Улучшенная версия)
     *
     * @param Model $modelInstance - Экземпляр модели
     * @return array
     */
    private static function getModelRelations($modelInstance)
    {
        $relations = [];
        try {
            $reflection = new ReflectionClass($modelInstance);
            $methods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);

            foreach ($methods as $method) {
                $methodName = $method->getName();

                // Базовые проверки: метод без параметров и не является "служебным"
                if ($method->getNumberOfRequiredParameters() == 0 &&
                    !in_array($methodName, [
                        '__construct', '__destruct', '__call', '__get', '__set',
                        'getTable', 'getKeyName', 'getPerPage', 'toArray', 'toJson',
                        'getFillable', 'getCasts', 'getDates', 'getHidden', 'getVisible',
                        'attributesToArray', 'relationsToArray'
                    ])
                ) {
                    // Попытка вызвать метод, чтобы проверить, является ли он отношением
                    try {
                        // Используем call_user_func для более безопасного вызова
                        $result = call_user_func([$modelInstance, $methodName]);

                        // Проверяем, является ли результат отношением Eloquent
                        if ($result instanceof \Illuminate\Database\Eloquent\Relations\Relation) {
                            $relatedModel = get_class($result->getRelated());
                            $relationType = class_basename(get_class($result));

                            $relationData = [
                                'type' => $relationType,
                                'related' => $relatedModel,
                                // Безопасно получаем ключи, проверяя существование методов
                                'foreignKey' => method_exists($result, 'getForeignKeyName') ? $result->getForeignKeyName() : null,
                                'ownerKey' => method_exists($result, 'getOwnerKeyName') ? $result->getOwnerKeyName() : null,
                                'relationMethodExists' => true // Флаг для отладки
                            ];

                            $relations[$methodName] = $relationData;
                        }
                    } catch (Exception $e) {
                        // Игнорируем ошибки при вызове методов, это нормально
                        // Метод может не быть отношением или требовать условий
                        Log::debug("Reference getModelRelations: Method '{$methodName}' is not a relation or threw an exception.", ['message' => $e->getMessage()]);
                    } catch (\Error $e) {
                        Log::debug("Reference getModelRelations: Fatal error calling method '{$methodName}'.", ['message' => $e->getMessage()]);
                    }
                }
            }
        } catch (Exception $e) {
            Log::warning("Reference getModelRelations warning: " . $e->getMessage(), ['exception' => $e]);
        } catch (\Error $e) {
            Log::error("Reference getModelRelations fatal error: " . $e->getMessage(), ['exception' => $e]);
        }

        return $relations;
    }

    /**
     * Получение списка доступных ключей для форматирования отображения
     * (Улучшенная версия)
     *
     * @param Model $modelInstance - Экземпляр модели
     * @param array $relations - Отношения модели, полученные через getModelRelations
     * @return array
     */
    private static function getAvailableKeys($modelInstance, $relations)
    {
        $availableKeys = [];

        // 1. Добавляем fillable поля основной модели
        foreach ($modelInstance->getFillable() as $field) {
            if (!in_array($field, ['id', 'created_at', 'updated_at'])) {
                $availableKeys[] = $field;
            }
        }

        // 2. Добавляем отношения (если они определены и успешно получены)
        foreach ($relations as $relationName => $relationInfo) {
            // Проверяем, что отношение "живое" (метод существует и был вызван)
            if (isset($relationInfo['relationMethodExists']) && $relationInfo['relationMethodExists']) {
                $relatedModelClass = $relationInfo['related'];
                if ($relatedModelClass && class_exists($relatedModelClass)) {
                    try {
                        // Создаем временный экземпляр связанной модели для получения её fillable
                        $relatedModelInstance = new $relatedModelClass;
                        foreach ($relatedModelInstance->getFillable() as $relatedField) {
                            if (!in_array($relatedField, ['id', 'created_at', 'updated_at'])) {
                                // Формат ключа: relation_name.field_name
                                $availableKeys[] = "{$relationName}.{$relatedField}";
                            }
                        }
                    } catch (Exception $e) {
                        Log::warning("Reference getAvailableKeys warning for related model '{$relatedModelClass}': " . $e->getMessage(), ['exception' => $e]);
                    } catch (\Error $e) {
                        Log::error("Reference getAvailableKeys fatal error for related model '{$relatedModelClass}': " . $e->getMessage(), ['exception' => $e]);
                    }
                } else {
                    Log::warning("Reference getAvailableKeys: Related model class '{$relatedModelClass}' does not exist for relation '{$relationName}'.");
                }
            }
        }

        return $availableKeys;
    }

    /**
     * Определение формата отображения по умолчанию
     *
     * @param array $availableKeys - Список доступных ключей
     * @return string
     */
    private static function getDefaultDisplayFormat($availableKeys)
    {
        // Приоритет полей для отображения по умолчанию
        $preferredFields = ['name', 'label', 'title', 'full_name', 'display_name'];

        foreach ($preferredFields as $field) {
            if (in_array($field, $availableKeys)) {
                return '{' . $field . '}';
            }
        }

        // Если нет предпочтительных полей, берем первое доступное (кроме служебных)
        if (!empty($availableKeys)) {
            return '{' . $availableKeys[0] . '}';
        }

        // Если совсем нет полей, используем ID
        return '{id}';
    }
}
