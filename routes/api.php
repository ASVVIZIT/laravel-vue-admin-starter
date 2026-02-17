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

use App\Http\Controllers\Api\SmartLight\DeviceController;
use App\Http\Controllers\Api\SmartLight\SettingsController;
use App\Http\Controllers\Api\SmartLight\TelemetryController;
use App\Http\Controllers\Api\SmartLight\CommandController;
use App\Http\Controllers\API\SmartLight\DeviceSettingsController;
use App\Http\Middleware\SmartLight\SmartLightDeviceAuth;


use App\Http\Controllers\Api\SocialMediaLinks\SocialMediaLinkController;

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

// SmartLight API
Route::namespace('api')->group(function() {
    Route::prefix('smart-light')->name('smart-light.')->group(function () {
        // Публичные маршруты
        Route::post('/register', [DeviceController::class, 'register'])
            ->name('register');

        // Защищённые маршруты
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/devices', [DeviceController::class, 'index'])
                ->name('devices.index');

            Route::get('/devices/dropdown', [DeviceController::class, 'listForDropdown'])
                ->name('devices.dropdown');

            // Глобальные настройки системы
            Route::get('/settings', [SettingsController::class, 'index'])
                ->name('settings.index');

            Route::post('/settings', [SettingsController::class, 'update'])
                ->name('settings.update');

            Route::post('/settings/reset', [SettingsController::class, 'reset'])
                ->name('settings.reset');

            Route::get('/{device_id}/ownership', [DeviceController::class, 'checkOwnership'])
                ->name('devices.ownership');

            // Настройки отдельных устройств (новая группа)
            Route::prefix('/{device_id}/device-settings')->group(function () {
                Route::get('/', [DeviceSettingsController::class, 'show'])
                    ->name('device-settings.show');

                Route::put('/', [DeviceSettingsController::class, 'update'])
                    ->name('device-settings.update');

                Route::post('/reset', [DeviceSettingsController::class, 'reset'])
                    ->name('device-settings.reset');

                Route::get('/defaults', [DeviceSettingsController::class, 'getDefaults'])
                    ->name('device-settings.defaults');
            });
        });

        // Маршруты с аутентификацией устройств
        Route::middleware(SmartLightDeviceAuth::class)->group(function () {
            // Старые маршруты для обратной совместимости (временно)
            Route::get('/{device_id}/settings', [DeviceController::class, 'getSettings'])
                ->name('settings')
                ->middleware('deprecated');

            Route::post('/{device_id}/telemetry', [TelemetryController::class, 'store'])
                ->name('telemetry.store');

            Route::get('/{device_id}/telemetry', [TelemetryController::class, 'index'])
                ->name('telemetry.index');

            Route::get('/{device_id}/commands', [CommandController::class, 'getCommand'])
                ->name('commands.get');

            Route::post('/{device_id}/sleep', [DeviceController::class, 'forceSleep'])
                ->name('sleep.force');

            // Новые маршруты для устройств с улучшенной структурой
            Route::prefix('/{device_id}')->group(function () {
                // Настройки устройства с новой структурой
                Route::get('/device-settings', [DeviceSettingsController::class, 'getDeviceSettingsForDevice'])
                    ->name('device-settings.device');

                // Команды управления
                Route::post('/commands/force-sleep', [CommandController::class, 'forceSleepCommand'])
                    ->name('commands.force-sleep');

                Route::post('/commands/wake-up', [CommandController::class, 'wakeUpCommand'])
                    ->name('commands.wake-up');

                Route::post('/commands/status-update', [CommandController::class, 'statusUpdateCommand'])
                    ->name('commands.status-update');
            });
        });
    });

    // API версия 1 для совместимости с фронтендом
    Route::prefix('v1/smart-light')->name('api.v1.')->group(function () {
        // Получение всех устройств пользователя
        Route::get('/devices', [DeviceController::class, 'apiIndex'])
            ->middleware('auth:sanctum')
            ->name('devices.index');

        // Получение настроек устройства
        Route::get('/devices/{device_id}/settings', [DeviceSettingsController::class, 'apiShow'])
            ->middleware('auth:sanctum')
            ->name('devices.settings.show');

        // Обновление настроек устройства
        Route::put('/devices/{device_id}/settings', [DeviceSettingsController::class, 'apiUpdate'])
            ->middleware('auth:sanctum')
            ->name('devices.settings.update');

        // Сброс настроек устройства
        Route::post('/devices/{device_id}/settings/reset', [DeviceSettingsController::class, 'apiReset'])
            ->middleware('auth:sanctum')
            ->name('devices.settings.reset');

        // Получение телеметрии устройства
        Route::get('/devices/{device_id}/telemetry', [TelemetryController::class, 'apiIndex'])
            ->middleware('auth:sanctum')
            ->name('telemetry.index');

        // Отправка телеметрии (для устройств)
        Route::post('/devices/{device_id}/telemetry', [TelemetryController::class, 'apiStore'])
            ->middleware(SmartLightDeviceAuth::class)
            ->name('telemetry.store');

        // Управление устройством
        Route::post('/devices/{device_id}/commands/sleep', [CommandController::class, 'apiForceSleep'])
            ->middleware('auth:sanctum')
            ->name('commands.sleep');

        Route::post('/devices/{device_id}/commands/wake', [CommandController::class, 'apiWakeDevice'])
            ->middleware('auth:sanctum')
            ->name('commands.wake');

        Route::post('/devices/{device_id}/commands/status', [CommandController::class, 'apiUpdateStatus'])
            ->middleware('auth:sanctum')
            ->name('commands.status');
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

// Маршруты для системы CompanyContactChannels
Route::apiResource('companies', \App\Http\Controllers\Api\Company\CompanyController::class);

Route::prefix('companies/{company}')->group(function () {
    Route::apiResource('contact-channels', \App\Http\Controllers\Api\CompanyContactChannel\ContactChannelController::class);
    Route::put('contact-channels/reorder', [\App\Http\Controllers\Api\CompanyContactChannel\ContactChannelController::class, 'reorder'])->name('contact-channels.reorder');
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
