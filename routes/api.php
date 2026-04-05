<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;
// Импорты моделей
use App\Models\Acl;
// === ИМПОРТЫ КОНТРОЛЛЕРОВ АВТОРИЗАЦИИ ===
// Эти контроллеры реализуют логику входа для разных типов пользователей
use App\Http\Controllers\Api\AuthController; // Для обычных пользователей
use App\Http\Controllers\Api\AdminAuthController; // Для админов
use App\Http\Controllers\Api\TesterController; // Для тестовых пользователей
// === КОНЕЦ ИМПОРТОВ КОНТРОЛЛЕРОВ АВТОРИЗАЦИИ ===

// Импорты других контроллеров (остаются как в оригинале)
use App\Http\Controllers\Api\UserTabController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\ReferenceController;
use App\Http\Controllers\Api\TableRowController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\Entity\MeasurementCategoryController;
use App\Http\Controllers\Api\Entity\MeasurementUnitController;
use App\Http\Controllers\Api\Entity\AccessoryController;
use App\Http\Controllers\Api\Entity\BrandController;
use App\Http\Controllers\Api\Entity\DeviceTypeController;
use App\Http\Controllers\TalkStream\ContactController;
use App\Http\Controllers\TalkStream\ChatController;
use App\Http\Controllers\TalkStream\CallController;
use App\Http\Controllers\TalkStream\FriendRequestController;
use App\Http\Controllers\Video\VideoController;


use App\Http\Controllers\Api\SmartLight\Core as CoreControllers;
use App\Http\Controllers\Api\SmartLight\V0 as V0Controllers;
use App\Http\Controllers\Api\SmartLight\V1 as V1Controllers;

use App\Http\Controllers\Api\SmartLight\DeviceController;
use App\Http\Controllers\Api\SmartLight\TypesController;
use App\Http\Controllers\Api\SmartLight\SettingsController;
use App\Http\Controllers\Api\SmartLight\TelemetryController;
use App\Http\Controllers\Api\SmartLight\CommandController;
use App\Http\Controllers\API\SmartLight\DeviceSettingsController;
use App\Http\Middleware\SmartLight\SmartLightDeviceAuth;

use App\Http\Controllers\Api\SocialMediaLinks\SocialMediaLinkController;

use App\Http\Controllers\Api\Company\CompanyController;
use App\Http\Controllers\Api\CompanyContactChannel\ContactChannelController;

// Импорты фасадов для отладочных маршрутов
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
// Импорт контракта Route для одного из примеров
use Illuminate\Contracts\Routing\Registrar as RouteContract;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Здесь регистрируются API маршруты для вашего приложения.
| Эти маршруты загружаются RouteServiceProvider и назначаются
| группе middleware "api". Это означает, что они автоматически
| получают префикс /api и middleware, определенные в Kernel.php
| для группы 'api' (обычно 'throttle:api').
|
| Структура файла (основана на предоставленном фрагменте):
| 1. Маршруты аутентификации (включая админскую и тестовую)
| 2. Пользовательские маршруты (требуют аутентификации)
| 3. TalkStream (чат и звонки)
| 4. Видео-функционал
| 5. Дополнительные сервисы
| 6. Демо-данные (тестовые заказы)
| 7. Отладочные и сервисные маршруты
|
| Все маршруты защищены соответствующими middleware.
|
*/

// ===================================================
// 1. МАРШРУТЫ АУТЕНТИФИКАЦИИ
// ===================================================
// --- Админский вход (не требует аутентификации Sanctum) ---
// POST /api/admin/auth/login
// Контроллер: App\Http\Controllers\Api\AdminAuthController@login
// Логика: Проверяет учетные данные админа (через config/auth.admin_users),
//         находит пользователя в БД, проверяет роль 'admin', создает токен.
Route::prefix('admin')->group(function () {
    Route::post('auth/login', [AdminAuthController::class, 'login']);
});

// --- Тестовый вход (только для не-production окружения) ---
// POST /api/tester/login/{role?}
// Контроллер: App\Http\Controllers\Api\TesterController@login
// Middleware: is_testing (проверяет APP_ENV)
// Логика: Создает временного тестового пользователя с указанной ролью,
//         устанавливает флаг is_test=1, создает токен.
Route::prefix('tester')->middleware('is_testing')->group(function () {
    Route::post('login/{role}', [TesterController::class, 'login']);
});

// --- Основные маршруты аутентификации (пространство имен Api) ---
// Это группа маршрутов, использующая пространство имен 'Api'.
// Она включает как публичные, так и защищенные маршруты.
Route::namespace('Api')->group(function() {
    // --- CSRF-защита для Sanctum ---
    // GET /api/sanctum/csrf-cookie
    // Контроллер: App\Http\Controllers\Api\AuthController@csrf
    // Логика: Устанавливает XSRF-TOKEN cookie для защиты от CSRF.
    Route::get('/sanctum/csrf-cookie', [AuthController::class, 'csrf']);

    // --- Обычный вход с защитой от IP-блокировок ---
    // POST /api/auth/login
    // Контроллер: App\Http\Controllers\Api\AuthController@login
    // Middleware: ip.banned (проверяет LoginAttempt на блокировку)
    // Логика: Проверяет учетные данные, логирует попытки,
    //         блокирует IP после 5 неудачных попыток, создает токен.
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('ip.banned');

    // --- Группа ЗАЩИЩЕННЫХ маршрутов (требуют аутентификации Sanctum) ---
    // Все маршруты внутри этой группы требуют действительного Bearer токена.
    Route::middleware('auth:sanctum')->group(function () {
        // --- Верификация email ---
        // POST /api/email/verify/{id}/{hash}
        Route::post('/email/verify/{id}/{hash}', [AuthController::class, 'verify']);
        // POST /api/email/resend
        Route::post('/email/resend', [AuthController::class, 'resendVerification']);
        // GET /api/email/verify
        Route::get('/email/verify', [AuthController::class, 'checkVerification']);

        // --- Управление сессиями (Выход) ---
        // POST /api/auth/logout
        // Контроллер: App\Http\Controllers\Api\AuthController@logout
        // Логика: Отзывает (удаляет) текущий токен пользователя.
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // --- Информация о пользователе ---
        // GET /api/user
        // Контроллер: App\Http\Controllers\Api\AuthController@user
        // Логика: Возвращает объект аутентифицированного пользователя.
        Route::get('/user', [AuthController::class, 'user']);

        // --- Пользовательские вкладки ---
        Route::apiResource('/user-tabs', UserTabController::class);

        // --- Шаблоны и строки таблиц ---
        Route::apiResource('templates', TemplateController::class);
        Route::apiResource('table-rows', TableRowController::class);

        // --- Справочники для шаблонов ---
        // Получение типов справочников
        Route::prefix('references')->group(function () {
            Route::get('types', [ReferenceController::class, 'getTypes']);
            // Например: GET /api/references/accessory?search=ABB&for_dropdown=1
            Route::get('{modelName}', [ReferenceController::class, 'getData']);
            // Например: GET /api/references/accessory/info
            Route::get('{modelName}/info', [ReferenceController::class, 'getFieldInfo']);
        });

        // --- Управление ролями и разрешениями ---
        // Требуют специального разрешения (Acl::PERMISSION_PERMISSION_MANAGE или Acl::PERMISSION_USER_MANAGE)
        Route::apiResource('roles', RoleController::class)->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
        Route::apiResource('users', UserController::class)->middleware('permission:' . Acl::PERMISSION_USER_MANAGE);
        Route::apiResource('permissions', PermissionController::class)->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);

        // --- Кастомные маршруты для пользователей ---
        // Используется объект $api (RouteContract) как в оригинале
        Route::prefix('users')->group(function (RouteContract $api) {
            // Получение разрешений пользователя (требует разрешения)
            $api->get('{user}/permissions', 'UserController@permissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
            // Обновление разрешений пользователя (требует разрешения)
            $api->put('{user}/permissions', 'UserController@updatePermissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
            // Получение логов пользователя
            $api->get('{user}/logs', 'LogController@index');
            // ... другие пользовательские маршруты
        });

        // --- Маршруты для сущностей (Entities) ---
        // Требуют специального разрешения (Acl::PERMISSION_ENTITY_MANAGE)
        Route::prefix('entities')->middleware('permission:' . Acl::PERMISSION_ENTITY_MANAGE)->group(function () {
            Route::apiResource('ep_brands', BrandController::class);
            Route::apiResource('ep_device_types', DeviceTypeController::class);
            Route::get('ep_measurement_categories/all', [MeasurementCategoryController::class, 'all'])->name('ep_measurement_categories.all');
            Route::apiResource('ep_measurement_categories', MeasurementCategoryController::class)->only(['index']);
            Route::apiResource('ep_measurement_units', MeasurementUnitController::class);
            Route::apiResource('ep_accessories', AccessoryController::class);
            // ... другие сущности
        });

        // --- TalkStream (чат и звонки) - внутри защищенной группы ---
        Route::prefix('talkstream')->group(function () {
            // Контакты
            Route::get('/user', [ContactController::class, 'show']);
            Route::get('/contacts', [ContactController::class, 'index']);
            Route::get('/contacts/{id}', [ContactController::class, 'show']);

            // Чат
            Route::post('/send', [ChatController::class, 'sendMessage']);
            Route::get('/history/{userId}', [ChatController::class, 'getHistory']);

            // Звонки
            Route::prefix('call')->group(function () {
                Route::post('/initiate', [CallController::class, 'initiate']);
                Route::post('/accept', [CallController::class, 'accept']);
                Route::post('/decline', [CallController::class, 'decline']);
                Route::post('/end', [CallController::class, 'end']);
                // Дополнительные маршруты звонков из фрагмента
                Route::post('/start', [CallController::class, 'startCall']);
                Route::post('/end', [CallController::class, 'endCall']); // Дублируется, но оставлено как в исходнике
            });

            // Друзья
            Route::prefix('friends')->group(function () {
                Route::get('/', [FriendRequestController::class, 'friends']);
                Route::get('/is-friend/{userId}', [FriendRequestController::class, 'isFriend']);
                Route::get('/incoming', [FriendRequestController::class, 'incoming']);
                Route::get('/sent', [FriendRequestController::class, 'sent']);
                Route::post('/send', [FriendRequestController::class, 'send']);
                Route::post('/accept/{id}', [FriendRequestController::class, 'accept']);
            });
        });

        // --- Видео-функционал (внутри защищенной группы) ---
        Route::prefix('video')->group(function () {
            // Предполагаемые маршруты, основанные на VideoController
            Route::get('/index', [VideoController::class, 'index']);
            Route::get('/file-list', [VideoController::class, 'getFileList']);
            Route::get('/scan-single', [VideoController::class, 'scanSingleFile']);
            Route::post('/scan-multiple', [VideoController::class, 'scanMultipleFiles']);
            // Статические видео-файлы - обычно не API маршрут, но оставлен как пример
            // Route::get('/files/{filename}', function ($filename) { ... });
        });

        // --- Другие потенциальные защищенные маршруты ---
        Route::get('requests', 'RequestController@index'); // Предполагается существование RequestController

    });
});

// ===================================================
// 2. Маршруты TalkStream (чат и коммуникации)
// (Некоторые маршруты дублируются из предыдущей группы)
// ===================================================
// Эта группа определяет пространство имен 'Api' снова.
// Это может быть избыточно, если оно уже установлено выше, но сохранено как в оригинале.
Route::namespace('Api')->group(function() {
    // --- Повторная CSRF-защита (для совместимости) ---
    // GET /api/sanctum/csrf-cookie
    // Дублируется из предыдущей группы.
    Route::get('/sanctum/csrf-cookie', [AuthController::class, 'csrf']);

    // --- Повторный маршрут входа (для совместимости) ---
    // POST /api/auth/login
    // Дублируется из предыдущей группы. Middleware 'ip.banned' не применено здесь в оригинале.
    Route::post('auth/login', [AuthController::class, 'login']);

    // --- Аутентификация для broadcasting (Laravel Echo) ---
    // POST /api/broadcasting/auth
    // Middleware: auth:sanctum (унаследовано от группы или должно быть добавлено)
    // Логика: Позволяет Laravel Echo аутентифицироваться для приватных каналов.
    Route::post('/broadcasting/auth', function (Request $request) {
        // Используем фасад Broadcast для аутентификации запроса на подписку
        return Broadcast::auth($request);
    })->middleware(['auth:sanctum']); // Убедитесь, что middleware применено
});

// ===================================================
// 4. Видео-функционал (дополнительные маршруты вне защищенной группы?)
// ===================================================
// Предполагая, что некоторые видео-маршруты могут быть публичными или имеют другую структуру
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/file-list', [VideoController::class, 'getFileList']);
Route::get('/videos/scan-single', [VideoController::class, 'scanSingleFile']);
Route::post('/videos/scan-multiple', [VideoController::class, 'scanMultipleFiles']);

// --- Статические видео-файлы (пример из фрагмента) ---
// GET /api/video-files/{filename}
// Логика: Отдает статические видеофайлы напрямую из storage.
Route::get('/video-files/{filename}', function ($filename) {
    $path = storage_path('/Videos/videos/' . $filename);
    if (!file_exists($path)) abort(404);
    $mimeTypes = [
        'webm' => 'video/webm',
        'mp4' => 'video/mp4',
        'mov' => 'video/quicktime',
        'avi' => 'video/x-msvideo',
        // Добавьте другие типы по необходимости
    ];
    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

    return response()->file($path, ['Content-Type' => $mimeType]);
});

// ===================================================
// 6. Демо-данные (тестовые заказы)
// ===================================================
// GET /api/orders
// Логика: Генерирует и возвращает фиктивные данные заказов.
Route::get('/orders', function () {
    $rowsNumber = 22;
    $data = [];
    for ($rowIndex = 0; $rowIndex < $rowsNumber; $rowIndex++) {
        $row = [
            'order_no' => 'LARAVUE' . ' ' . mt_rand(1000000, 9999999),
            'price' => mt_rand(10000, 999999),
            'status' => randomInArray(['success', 'pending', 'error']),
        ];
        $data[] = $row;
    }
    return responseSuccess(['items' => $data]);
});

// ===================================================
// 3. Отладочные и сервисные маршруты
// ===================================================
// GET /api/debug/network
// Логика: Проверяет подключение к БД и Redis, возвращает информацию о запросе.
Route::get('/debug/network', function(Request $request) {
    // Проверка подключений
    $dbConnected = false;
    $redisConnected = false;
    try {
        $dbConnected = DB::connection()->getPdo() ? true : false;
    } catch (\Exception $e) {
        // Логика обработки ошибки подключения к БД
        \Log::error("DB Connection Error: " . $e->getMessage());
    }

    try {
        $redisConnected = Redis::connection()->ping() === true;
    } catch (\Exception $e) {
        // Логика обработки ошибки подключения к Redis
        \Log::error("Redis Connection Error: " . $e->getMessage());
    }

    return response()->json([
        'client_ip' => $request->ip(),
        'headers' => $request->headers->all(),
        'server' => $_SERVER,
        'connections' => [
            'database' => $dbConnected,
            'redis' => $redisConnected,
        ]
    ]);
});

/*
|--------------------------------------------------------------------------
| SmartLight API Routes — ТРИ СЛОЯ: Core, V0, V1
|--------------------------------------------------------------------------
| Core  → для фронтенда (человеческие пути, без версии)
| V0    → legacy поддержка (старые клиенты)
| V1    → версионированный API (внешняя интеграция)
|--------------------------------------------------------------------------
*/

Route::namespace('Api\\SmartLight')
    ->prefix('smart-light')
    ->name('smart-light.')
    ->group(function () {

    // ===== ПУБЛИЧНЫЕ (без авторизации) =====
    Route::post('/register', [CoreControllers\CoreDeviceController::class, 'register'])->name('register');

    // ===== DEVICE AUTH (для устройств, по api_key) =====
    Route::middleware(\App\Http\Middleware\SmartLight\SmartLightDeviceAuth::class)->group(function () {
        Route::post('/{device_id}/telemetry', [CoreControllers\CoreTelemetryController::class, 'store'])->name('telemetry.store');
        Route::get('/{device_id}/telemetry', [CoreControllers\CoreTelemetryController::class, 'index'])->name('telemetry.index');
        Route::get('/{device_id}/commands', [CoreControllers\CoreCommandController::class, 'getPending'])->name('commands.pending');

        // Настройки для устройств (минимальный набор)
        Route::get('/{device_id}/settings/device-auth', [CoreControllers\CoreDeviceSettingsController::class, 'getForDeviceAuth'])->name('settings.device-auth');

        // Legacy endpoint (deprecated)
        Route::get('/{device_id}/settings', [CoreControllers\CoreDeviceController::class, 'getLegacySettings'])->name('settings.legacy')->middleware('deprecated');
    });

    // ===== USER AUTH (для фронтенда, по Sanctum) =====
    Route::middleware('auth:sanctum')->group(function () {

        // ===== CORE API — УСТРОЙСТВА (жизненный цикл + команды) =====
        Route::prefix('devices')->name('devices.')->group(function () {

            // CRUD + список
            Route::get('/', [CoreControllers\CoreDeviceController::class, 'index'])->name('index');
            Route::get('/dropdown', [CoreControllers\CoreDeviceController::class, 'listForDropdown'])->name('dropdown');
            Route::get('/{device_id}', [CoreControllers\CoreDeviceController::class, 'show'])->name('show');
            Route::delete('/{device_id}', [CoreControllers\CoreDeviceController::class, 'destroy'])->name('destroy');

            // Проверка прав
            Route::get('/{device_id}/ownership', [CoreControllers\CoreDeviceController::class, 'checkOwnership'])->name('ownership');

            // Статус и интенсивность
            Route::put('/{device_id}/status', [CoreControllers\CoreDeviceController::class, 'updateStatus'])->name('status.update');
            Route::put('/{device_id}/intensity', [CoreControllers\CoreDeviceController::class, 'updateIntensity'])->name('intensity.update');

            // Команды
            Route::post('/{device_id}/sleep', [CoreControllers\CoreDeviceController::class, 'forceSleep'])->name('sleep');
            Route::post('/{device_id}/wake', [CoreControllers\CoreDeviceController::class, 'wakeDevice'])->name('wake');

            // Телеметрия и статусы
            Route::get('/{device_id}/telemetry', [CoreControllers\CoreDeviceController::class, 'getTelemetry'])->name('telemetry');
            Route::get('/{device_id}/battery', [CoreControllers\CoreDeviceController::class, 'getBatteryStatus'])->name('battery');
            Route::get('/{device_id}/power', [CoreControllers\CoreDeviceController::class, 'getPowerStatus'])->name('power');
        });

        // ===== CORE API — НАСТРОЙКИ (конфигурация) =====
        Route::prefix('devices/{device_id}/settings')->name('devices.settings.')->group(function () {
            Route::get('/', [CoreControllers\CoreDeviceSettingsController::class, 'show'])->name('show');
            Route::put('/', [CoreControllers\CoreDeviceSettingsController::class, 'update'])->name('update');
            Route::post('/reset', [CoreControllers\CoreDeviceSettingsController::class, 'reset'])->name('reset');
            Route::get('/defaults', [CoreControllers\CoreDeviceSettingsController::class, 'getDefaults'])->name('defaults');
        });

        // ===== СПРАВОЧНИКИ =====
        Route::get('/battery-types', [CoreControllers\CoreTypesController::class, 'batteryTypes'])->name('battery-types.index');
        Route::get('/bulb-types', [CoreControllers\CoreTypesController::class, 'bulbTypes'])->name('bulb-types.index');
        Route::get('/power-supplies', [CoreControllers\CoreTypesController::class, 'powerSupplies'])->name('power-supplies.index');

        // ===== ГЛОБАЛЬНЫЕ НАСТРОЙКИ =====
        Route::get('/settings', [CoreControllers\CoreSettingsController::class, 'index'])->name('global-settings.index');
        Route::post('/settings', [CoreControllers\CoreSettingsController::class, 'update'])->name('global-settings.update');
        Route::post('/settings/reset', [CoreControllers\CoreSettingsController::class, 'reset'])->name('global-settings.reset');

        // ===== V0 API (legacy) =====
        Route::prefix('v0')->name('v0.')->group(function () {
            Route::get('/devices', [V0Controllers\V0DeviceController::class, 'index'])->name('devices.index');
            Route::get('/devices/{device_id}', [V0Controllers\V0DeviceController::class, 'show'])->name('devices.show');
            Route::post('/devices/{device_id}/sleep', [V0Controllers\V0CommandController::class, 'sleep'])->name('devices.sleep');
            Route::post('/devices/{device_id}/wake', [V0Controllers\V0CommandController::class, 'wake'])->name('devices.wake');
            Route::post('/devices/{device_id}/status', [V0Controllers\V0CommandController::class, 'updateStatus'])->name('devices.status');

            // V0 настройки (вложенный префикс)
            Route::prefix('/devices/{device_id}/device-settings')->name('device-settings.')->group(function () {
                Route::get('/', [V0Controllers\V0DeviceSettingsController::class, 'show'])->name('show');
                Route::put('/', [V0Controllers\V0DeviceSettingsController::class, 'update'])->name('update');
            });
        });

        // ===== V1 API (REST, строгий) =====
        Route::prefix('v1')->name('v1.')->group(function () {
            Route::apiResource('devices', V1Controllers\V1DeviceController::class)
                ->only(['index', 'show', 'update', 'destroy'])
                ->parameters(['devices' => 'device_id']);

            Route::post('/devices/{device_id}/commands/sleep', [V1Controllers\V1CommandController::class, 'sleep'])->name('commands.sleep');
            Route::post('/devices/{device_id}/commands/wake', [V1Controllers\V1CommandController::class, 'wake'])->name('commands.wake');
            Route::post('/devices/{device_id}/commands/status', [V1Controllers\V1CommandController::class, 'status'])->name('commands.status');

            Route::apiResource('devices.settings', V1Controllers\V1DeviceSettingsController::class)
                ->only(['show', 'update'])
                ->parameters(['settings' => 'device_id']);

            Route::apiResource('battery-types', V1Controllers\V1TypesController::class)->only(['index', 'show'])->parameters(['battery-types' => 'battery_type_id']);
            Route::apiResource('bulb-types', V1Controllers\V1TypesController::class)->only(['index', 'show'])->parameters(['bulb-types' => 'bulb_type_id']);
            Route::apiResource('power-supplies', V1Controllers\V1TypesController::class)->only(['index', 'show'])->parameters(['power-supplies' => 'power_supply_id']);
        });

    });
});

// Публичный доступ для получения списка ссылок
Route::get('social-media-links', [SocialMediaLinkController::class, 'index']);

// Защищенные маршруты для управления
Route::middleware('auth:sanctum')->group(function () {
    Route::post('social-media-links', [SocialMediaLinkController::class, 'store']);
    Route::put('social-media-links/{id}', [SocialMediaLinkController::class, 'update']);
    Route::delete('social-media-links/{id}', [SocialMediaLinkController::class, 'destroy']);
    Route::post('social-media-links/reorder', [SocialMediaLinkController::class, 'reorder']);
});

// ============================================================================
// COMPANIES & CHANNELS ROUTES
// ============================================================================
// Маршрут для получения COUNT компаний
Route::get('/companies/meta/total', [CompanyController::class, 'count']);

// Маршрут для получения COUNT компаний (должен быть ДО apiResource!)
Route::apiResource('companies', CompanyController::class)->where(['company' => '[0-9]+']);

// ============================================================================
// CHANNELS — ОТДЕЛЬНЫЙ РАЗДЕЛ (С ПАГИНАЦИЕЙ)
// ============================================================================

// Получить количество каналов (для прогресс бара)
Route::get('/channels/meta/total', [ContactChannelController::class, 'count'])->name('api.channels.count');

// Получить все каналы (с пагинацией и фильтрами)
Route::get('/channels', [ContactChannelController::class, 'index'])->name('api.channels.index');

// ✅ SYNC ENDPOINT (ДЛЯ БУДУЩЕЙ СИНХРОНИЗАЦИИ С INDEXEDDB)
Route::get('/channels/sync', [ContactChannelController::class, 'sync'])->name('api.channels.sync');

// Сортировка каналов
Route::put('/channels/reorder', [ContactChannelController::class, 'reorder'])->name('api.channels.reorder');

// Получить один канал
Route::get('/channels/{contactChannel}', [ContactChannelController::class, 'show'])->name('api.channels.show');

// Создать канал
Route::post('/channels', [ContactChannelController::class, 'store'])->name('api.channels.store');

// Обновить канал
Route::put('/channels/{contactChannel}', [ContactChannelController::class, 'update'])->name('api.channels.update');

// Удалить канал
Route::delete('/channels/{contactChannel}', [ContactChannelController::class, 'destroy'])->name('api.channels.destroy');


// ============================================================================
// CHANNELS BY COMPANY (для совместимости)
// ============================================================================

Route::prefix('companies/{company}')->group(function () {
    Route::get('/contact-channels', [ContactChannelController::class, 'indexByCompany'])->name('api.companies.channels.indexByCompany');
    Route::post('/contact-channels', [ContactChannelController::class, 'store'])->name('api.companies.channels.store');
    Route::put('/contact-channels/reorder', [ContactChannelController::class, 'reorder'])->name('api.companies.channels.reorder');
    Route::get('/contact-channels/{contactChannel}', [ContactChannelController::class, 'show'])->name('api.companies.channels.show');
    Route::put('/contact-channels/{contactChannel}', [ContactChannelController::class, 'update'])->name('api.companies.channels.update');
    Route::delete('/contact-channels/{contactChannel}', [ContactChannelController::class, 'destroy'])->name('api.companies.channels.destroy');
});

// ===================================================
// Регистрация middleware для роутов
// (Обычно находится в AppServiceProvider или RouteServiceProvider, а не здесь)
// ===================================================
// Примечание: Этот блок обычно не размещается в routes/api.php.
// Он показан здесь для полноты картины, основанной на комментариях в вашем файле.
// App::booted(function() {
// Регистрация middleware 'ip.banned'
// Route::aliasMiddleware('ip.banned', \App\Http\Middleware\CheckIpBanned::class);
// Регистрация middleware 'is_testing'
// Route::aliasMiddleware('is_testing', \App\Http\Middleware\IsTestingEnvironment::class);
// });
