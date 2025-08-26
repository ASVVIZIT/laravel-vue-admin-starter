<?php
// app/Http/Controllers/Api/ReferenceController.php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\Models\Reference; // Используем нашу модель Reference
use Exception;
use Throwable; // Для более широкого захвата ошибок

class ReferenceController extends Controller
{
    /**
     * Получение списка типов справочников
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTypes()
    {
        try {
            $types = Reference::getKnownTypes();
            return response()->json([
                'data' => $types
            ])->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        } catch (Exception $e) {
            Log::error('ReferenceController getTypes error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'error' => 'Ошибка при загрузке типов справочников',
                'details' => $e->getMessage()
            ], 500);
        } catch (\Error $e) {
            Log::error('ReferenceController getTypes fatal error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'error' => 'Критическая ошибка при загрузке типов справочников',
                'details' => $e->getMessage()
            ], 500);
        }
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
        // 1. Очистка и валидация параметра маршрута
        $cleanModelName = trim(str_replace(['/', '\\'], '', $modelName ?? ''));

        if (empty($cleanModelName)) {
            Log::warning('ReferenceController getData called with empty modelName.');
            return response()->json([
                'error' => 'Название модели не указано.',
            ], 400); // Bad Request
        }

        try {
            // 2. Собираем параметры запроса
            $params = [
                'search' => $request->filled('search') ? $request->search : null,
                'for_dropdown' => $request->boolean('for_dropdown'),
                'per_page' => $request->per_page ?? 10
            ];

            // 3. Вызываем метод модели для получения данных
            $result = Reference::getData($cleanModelName, $params);

            return response()->json($result);

        } catch (Exception $e) {
            Log::error("ReferenceController getData error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);
            // Возвращаем сообщение из исключения модели
            return response()->json([
                'error' => 'Ошибка при загрузке данных справочника',
                'details' => $e->getMessage()
            ], 500);
        } catch (\Error $e) {
            Log::error("ReferenceController getData fatal error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'error' => 'Критическая ошибка при загрузке данных справочника',
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
        // 1. Очистка и валидация параметра маршрута
        $cleanModelName = trim(str_replace(['/', '\\'], '', $modelName ?? ''));

        if (empty($cleanModelName)) {
            Log::warning('ReferenceController getFieldInfo called with empty modelName.');
            return response()->json([
                'error' => 'Название модели не указано.',
            ], 400); // Bad Request
        }

        try {
            // 2. === ВЫЗЫВАЕМ МЕТОД МОДЕЛИ ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О ПОЛЯХ ===
            $fieldInfo = Reference::getFieldInfo($cleanModelName);

            return response()->json([
                'data' => $fieldInfo
            ]);

        } catch (Exception $e) {
            // === УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК ===
            Log::error("ReferenceController getFieldInfo error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);

            // Определяем HTTP-статус на основе типа ошибки, если нужно
            $statusCode = 500;
            $errorMessage = 'Ошибка при получении информации о полях справочника';

            // Проверяем сообщение об ошибке для определения типа
            if (strpos($e->getMessage(), 'Неизвестный тип справочника') !== false) {
                $statusCode = 404;
                $errorMessage = 'Тип справочника не найден';
            } elseif (strpos($e->getMessage(), 'Класс модели не найден') !== false || strpos($e->getMessage(), 'Класс модели не определен') !== false) {
                $statusCode = 500;
                $errorMessage = 'Внутренняя ошибка конфигурации: модель не найдена';
            } elseif (strpos($e->getMessage(), 'Call to a member function') !== false && strpos($e->getMessage(), 'connection() on null') !== false) {
                // Очень специфичная ошибка, которую мы поймали раньше
                $statusCode = 500;
                $errorMessage = 'Внутренняя ошибка сервера: проблема с подключением к базе данных модели';
            }

            return response()->json([
                'error' => $errorMessage,
                'details' => $e->getMessage() // Передаем оригинальное сообщение для отладки
            ], $statusCode);

        } catch (\Error $e) { // Ловим фатальные ошибки PHP
            Log::error("ReferenceController getFieldInfo fatal error for model '{$cleanModelName}': " . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'error' => 'Критическая ошибка при получении информации о полях справочника',
                'details' => $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine() // Добавляем место ошибки
            ], 500);
        }
    }
}
