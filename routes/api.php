<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;

// Импорты моделей
use App\Models\Acl;

// === ИМПОРТЫ КОНТРОЛЛЕРОВ АВТОРИЗАЦИИ ===
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\TesterController;

// Импорты других контроллеров
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

use App\Http\Controllers\Api\Landing\LandingPageController;
use App\Http\Controllers\Api\Landing\SiteSettingsController;


use App\Http\Controllers\Api\Training\ExerciseController;
use App\Http\Controllers\Api\Training\TrainingLogController;
use App\Http\Controllers\Api\Training\TrainingSettingsController;
use App\Http\Controllers\Api\Training\TrainingExportController;

// Импорты фасадов для отладочных маршрутов
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Contracts\Routing\Registrar as RouteContract;

/*
|--------------------------------------------------------------------------
| API Routes — FenixPortal
|--------------------------------------------------------------------------
|
| Все маршруты автоматически получают префикс /api
| Структура:
| 1. 🌐 ПУБЛИЧНЫЕ API (без авторизации)
| 2. 🔐 АУТЕНТИФИКАЦИЯ (вход/выход/CSRF)
| 3. 🛡️ ЗАЩИЩЁННЫЕ API (требуют auth:sanctum) — для Admin SPA
| 4. 📱 SMARTLIGHT API (устройства)
| 5. 🎯 TRAINING API (тренировки)
| 6. 🏢 COMPANIES & CHANNELS API
| 7. 🔧 ОТЛАДОЧНЫЕ МАРШРУТЫ
|
*/

// ============================================================================
// 🌐 1. ПУБЛИЧНЫЕ API (без авторизации)
// ============================================================================
// Эти маршруты доступны всем, включая публичную часть сайта

// Публичный доступ для получения списка ссылок (для публичной части)
Route::get('social-media-links', [SocialMediaLinkController::class, 'index']);

// Статические видео-файлы (публичный доступ)
Route::get('/video-files/{filename}', function ($filename) {
    $path = storage_path('/Videos/videos/' . $filename);
    if (!file_exists($path)) abort(404);
    $mimeTypes = [
        'webm' => 'video/webm',
        'mp4' => 'video/mp4',
        'mov' => 'video/quicktime',
        'avi' => 'video/x-msvideo',
    ];
    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

    return response()->file($path, ['Content-Type' => $mimeType]);
});

// Демо-данные (тестовые заказы)
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

// ============================================================================
// 🔐 2. АУТЕНТИФИКАЦИЯ (вход/выход/CSRF)
// ============================================================================

// --- Админский вход (не требует аутентификации Sanctum) ---
Route::prefix('admin')->group(function () {
    Route::post('auth/login', [AdminAuthController::class, 'login']);
});

// --- Тестовый вход (только для не-production окружения) ---
Route::prefix('tester')->middleware('is_testing')->group(function () {
    Route::post('login/{role}', [TesterController::class, 'login']);
});

// --- Основные маршруты аутентификации ---
Route::namespace('Api')->group(function() {
    // CSRF-защита для Sanctum
    Route::get('/sanctum/csrf-cookie', [AuthController::class, 'csrf']);

    // Обычный вход с защитой от IP-блокировок
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('ip.banned');

    // === ЗАЩИЩЁННЫЕ МАРШРУТЫ (требуют auth:sanctum) ===
    Route::middleware('auth:sanctum')->group(function () {

        // --- Верификация email ---
        Route::post('/email/verify/{id}/{hash}', [AuthController::class, 'verify']);
        Route::post('/email/resend', [AuthController::class, 'resendVerification']);
        Route::get('/email/verify', [AuthController::class, 'checkVerification']);

        // --- Управление сессиями (Выход) ---
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // --- Информация о пользователе ---
        Route::get('/user', [AuthController::class, 'user']);

        // ====================================================================
        // 🛡️ 3. ЗАЩИЩЁННЫЕ API — для Admin SPA
        // ====================================================================

        // --- Пользовательские вкладки ---
        Route::apiResource('/user-tabs', UserTabController::class);

        // --- Шаблоны и строки таблиц ---
        Route::apiResource('templates', TemplateController::class);
        Route::apiResource('table-rows', TableRowController::class);

        // --- Справочники для шаблонов ---
        Route::prefix('references')->group(function () {
            Route::get('types', [ReferenceController::class, 'getTypes']);
            Route::get('{modelName}', [ReferenceController::class, 'getData']);
            Route::get('{modelName}/info', [ReferenceController::class, 'getFieldInfo']);
        });

        // --- Управление ролями и разрешениями ---
        Route::apiResource('roles', RoleController::class)->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
        Route::apiResource('users', UserController::class)->middleware('permission:' . Acl::PERMISSION_USER_MANAGE);
        Route::apiResource('permissions', PermissionController::class)->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);

        // --- Кастомные маршруты для пользователей ---
        Route::prefix('users')->group(function (RouteContract $api) {
            $api->get('{user}/permissions', 'UserController@permissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
            $api->put('{user}/permissions', 'UserController@updatePermissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
            $api->get('{user}/logs', 'LogController@index');
        });

        // --- Маршруты для сущностей (Entities) ---
        Route::prefix('entities')->middleware('permission:' . Acl::PERMISSION_ENTITY_MANAGE)->group(function () {
            Route::apiResource('ep_brands', BrandController::class);
            Route::apiResource('ep_device_types', DeviceTypeController::class);
            Route::get('ep_measurement_categories/all', [MeasurementCategoryController::class, 'all'])->name('ep_measurement_categories.all');
            Route::apiResource('ep_measurement_categories', MeasurementCategoryController::class)->only(['index']);
            Route::apiResource('ep_measurement_units', MeasurementUnitController::class);
            Route::apiResource('ep_accessories', AccessoryController::class);
        });

        // --- TalkStream (чат и звонки) ---
        Route::prefix('talkstream')->group(function () {
            Route::get('/user', [ContactController::class, 'show']);
            Route::get('/contacts', [ContactController::class, 'index']);
            Route::get('/contacts/{id}', [ContactController::class, 'show']);

            Route::post('/send', [ChatController::class, 'sendMessage']);
            Route::get('/history/{userId}', [ChatController::class, 'getHistory']);

            Route::prefix('call')->group(function () {
                Route::post('/initiate', [CallController::class, 'initiate']);
                Route::post('/accept', [CallController::class, 'accept']);
                Route::post('/decline', [CallController::class, 'decline']);
                Route::post('/end', [CallController::class, 'end']);
                Route::post('/start', [CallController::class, 'startCall']);
                Route::post('/end', [CallController::class, 'endCall']);
            });

            Route::prefix('friends')->group(function () {
                Route::get('/', [FriendRequestController::class, 'friends']);
                Route::get('/is-friend/{userId}', [FriendRequestController::class, 'isFriend']);
                Route::get('/incoming', [FriendRequestController::class, 'incoming']);
                Route::get('/sent', [FriendRequestController::class, 'sent']);
                Route::post('/send', [FriendRequestController::class, 'send']);
                Route::post('/accept/{id}', [FriendRequestController::class, 'accept']);
            });
        });

        // --- Видео-функционал (ЗАЩИЩЁННЫЙ) ---
        Route::prefix('video')->group(function () {
            Route::get('/index', [VideoController::class, 'index']);
            Route::get('/file-list', [VideoController::class, 'getFileList']);
            Route::get('/scan-single', [VideoController::class, 'scanSingleFile']);
            Route::post('/scan-multiple', [VideoController::class, 'scanMultipleFiles']);
        });

        // --- Другие защищённые маршруты ---
        Route::get('requests', 'RequestController@index');
    });
});

// ============================================================================
// 🔄 ДУБЛИРОВАНИЕ (для обратной совместимости) — НЕ УДАЛЯЕМ
// ============================================================================
Route::namespace('Api')->group(function() {
    Route::get('/sanctum/csrf-cookie', [AuthController::class, 'csrf']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // Аутентификация для broadcasting (Laravel Echo)
    Route::post('/broadcasting/auth', function (Request $request) {
        return Broadcast::auth($request);
    })->middleware(['auth:sanctum']);
});

// ============================================================================
// 📹 4. ВИДЕО-ФУНКЦИОНАЛ (дополнительные маршруты)
// ============================================================================
// ⚠️ Эти маршруты вне защищённой группы (для совместимости)
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/file-list', [VideoController::class, 'getFileList']);
Route::get('/videos/scan-single', [VideoController::class, 'scanSingleFile']);
Route::post('/videos/scan-multiple', [VideoController::class, 'scanMultipleFiles']);

// ============================================================================
// 📱 5. SMARTLIGHT API (устройства)
// ============================================================================
Route::namespace('Api\\SmartLight')
    ->prefix('smart-light')
    ->name('smart-light.')
    ->group(function () {

        // ПУБЛИЧНЫЕ (без авторизации)
        Route::post('/register', [CoreControllers\CoreDeviceController::class, 'register'])->name('register');

        // DEVICE AUTH (для устройств, по api_key)
        Route::middleware(\App\Http\Middleware\SmartLight\SmartLightDeviceAuth::class)->group(function () {
            Route::post('/{device_id}/telemetry', [CoreControllers\CoreTelemetryController::class, 'store'])->name('telemetry.store');
            Route::get('/{device_id}/telemetry', [CoreControllers\CoreTelemetryController::class, 'index'])->name('telemetry.index');
            Route::get('/{device_id}/commands', [CoreControllers\CoreCommandController::class, 'getPending'])->name('commands.pending');
            Route::get('/{device_id}/settings/device-auth', [CoreControllers\CoreDeviceSettingsController::class, 'getForDeviceAuth'])->name('settings.device-auth');
            Route::get('/{device_id}/settings', [CoreControllers\CoreDeviceController::class, 'getLegacySettings'])->name('settings.legacy')->middleware('deprecated');
        });

        // USER AUTH (для фронтенда, по Sanctum)
        Route::middleware('auth:sanctum')->group(function () {

            // CORE API — УСТРОЙСТВА
            Route::prefix('devices')->name('devices.')->group(function () {
                Route::get('/', [CoreControllers\CoreDeviceController::class, 'index'])->name('index');
                Route::get('/dropdown', [CoreControllers\CoreDeviceController::class, 'listForDropdown'])->name('dropdown');
                Route::get('/{device_id}', [CoreControllers\CoreDeviceController::class, 'show'])->name('show');
                Route::delete('/{device_id}', [CoreControllers\CoreDeviceController::class, 'destroy'])->name('destroy');
                Route::get('/{device_id}/ownership', [CoreControllers\CoreDeviceController::class, 'checkOwnership'])->name('ownership');
                Route::put('/{device_id}/status', [CoreControllers\CoreDeviceController::class, 'updateStatus'])->name('status.update');
                Route::put('/{device_id}/intensity', [CoreControllers\CoreDeviceController::class, 'updateIntensity'])->name('intensity.update');
                Route::post('/{device_id}/sleep', [CoreControllers\CoreDeviceController::class, 'forceSleep'])->name('sleep');
                Route::post('/{device_id}/wake', [CoreControllers\CoreDeviceController::class, 'wakeDevice'])->name('wake');
                Route::get('/{device_id}/telemetry', [CoreControllers\CoreDeviceController::class, 'getTelemetry'])->name('telemetry');
                Route::get('/{device_id}/battery', [CoreControllers\CoreDeviceController::class, 'getBatteryStatus'])->name('battery');
                Route::get('/{device_id}/power', [CoreControllers\CoreDeviceController::class, 'getPowerStatus'])->name('power');
            });

            // CORE API — НАСТРОЙКИ
            Route::prefix('devices/{device_id}/settings')->name('devices.settings.')->group(function () {
                Route::get('/', [CoreControllers\CoreDeviceSettingsController::class, 'show'])->name('show');
                Route::put('/', [CoreControllers\CoreDeviceSettingsController::class, 'update'])->name('update');
                Route::post('/reset', [CoreControllers\CoreDeviceSettingsController::class, 'reset'])->name('reset');
                Route::get('/defaults', [CoreControllers\CoreDeviceSettingsController::class, 'getDefaults'])->name('defaults');
            });

            // СПРАВОЧНИКИ
            Route::get('/battery-types', [CoreControllers\CoreTypesController::class, 'batteryTypes'])->name('battery-types.index');
            Route::get('/bulb-types', [CoreControllers\CoreTypesController::class, 'bulbTypes'])->name('bulb-types.index');
            Route::get('/power-supplies', [CoreControllers\CoreTypesController::class, 'powerSupplies'])->name('power-supplies.index');

            // ГЛОБАЛЬНЫЕ НАСТРОЙКИ
            Route::get('/settings', [CoreControllers\CoreSettingsController::class, 'index'])->name('global-settings.index');
            Route::post('/settings', [CoreControllers\CoreSettingsController::class, 'update'])->name('global-settings.update');
            Route::post('/settings/reset', [CoreControllers\CoreSettingsController::class, 'reset'])->name('global-settings.reset');

            // V0 API (legacy)
            Route::prefix('v0')->name('v0.')->group(function () {
                Route::get('/devices', [V0Controllers\V0DeviceController::class, 'index'])->name('devices.index');
                Route::get('/devices/{device_id}', [V0Controllers\V0DeviceController::class, 'show'])->name('devices.show');
                Route::post('/devices/{device_id}/sleep', [V0Controllers\V0CommandController::class, 'sleep'])->name('devices.sleep');
                Route::post('/devices/{device_id}/wake', [V0Controllers\V0CommandController::class, 'wake'])->name('devices.wake');
                Route::post('/devices/{device_id}/status', [V0Controllers\V0CommandController::class, 'updateStatus'])->name('devices.status');

                Route::prefix('/devices/{device_id}/device-settings')->name('device-settings.')->group(function () {
                    Route::get('/', [V0Controllers\V0DeviceSettingsController::class, 'show'])->name('show');
                    Route::put('/', [V0Controllers\V0DeviceSettingsController::class, 'update'])->name('update');
                });
            });

            // V1 API (REST, строгий)
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

// ============================================================================
// 🎯 6. TRAINING API (тренировки)
// ============================================================================
Route::namespace('Api\\Training')
    ->prefix('training')
    ->name('training.')
    ->group(function () {

        // ПУБЛИЧНЫЕ МАРШРУТЫ (справочники)
        Route::get('/exercises', [ExerciseController::class, 'index'])->name('exercises.index');

        // ЗАЩИЩЁННЫЕ МАРШРУТЫ (auth:sanctum)
        Route::middleware('auth:sanctum')->group(function () {

            // CORE API — ЖУРНАЛ ТРЕНИРОВОК
            Route::prefix('logs')->name('logs.')->group(function () {
                Route::get('/', [TrainingLogController::class, 'index'])->name('index');
                Route::post('/', [TrainingLogController::class, 'store'])->name('store');
                Route::put('/{log}', [TrainingLogController::class, 'update'])->name('update');
                Route::delete('/{log}', [TrainingLogController::class, 'destroy'])->name('destroy');
            });

            // СЕРВЕРНАЯ ГРУППИРОВКА
            Route::get('/logs/grouped', [TrainingLogController::class, 'grouped'])->name('logs.grouped');

            // ACTIONS API (soft deletes)
            Route::prefix('logs/{log}')->name('logs.')->group(function () {
                Route::post('/restore', [TrainingLogController::class, 'restore'])->name('restore');
                Route::delete('/force', [TrainingLogController::class, 'forceDelete'])->name('force');
            });

            // STATS API
            Route::prefix('stats')->name('stats.')->group(function () {
                Route::get('/', [TrainingLogController::class, 'stats'])->name('index');
                Route::get('/summary', [TrainingLogController::class, 'summary'])->name('summary');
            });

            // EXPORT API (Потоковая выгрузка отчетов)
            Route::prefix('export')->name('export.')->group(function () {
                Route::get('/csv', [TrainingExportController::class, 'exportCsv'])->name('csv');
            });

            // SETTINGS API
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', [TrainingSettingsController::class, 'index'])->name('index');
                Route::put('/', [TrainingSettingsController::class, 'update'])->name('update');
            });

            // SHARING API
            Route::prefix('users')->name('users.')->group(function () {
                Route::get('/search', function (
                    Request $request,
                    \App\Services\Training\TrainingSettingsService $settingsService
                ) {
                    $search = $request->get('search', '');
                    $minLength = $settingsService->getLimit('search_min_length');

                    if (strlen($search) < $minLength) {
                        return response()->json(['success' => true, 'data' => []]);
                    }

                    $searchLimit = $settingsService->getLimit('search_results_limit');

                    $users = \App\Models\User::query()
                        ->where(function ($q) use ($search) {
                            $q->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('email', 'LIKE', "%{$search}%");
                        })
                        ->where('id', '!=', auth()->id())
                        ->limit($searchLimit)
                        ->get(['id', 'name', 'email']);

                    return response()->json(['success' => true, 'data' => $users]);
                })->name('search');

                Route::get('/by-ids', function (
                    Request $request,
                    \App\Services\Training\TrainingSettingsService $settingsService
                ) {
                    $ids = explode(',', $request->get('ids', ''));
                    $ids = array_filter(array_map('intval', $ids));

                    if (empty($ids)) {
                        return response()->json(['success' => true, 'data' => []]);
                    }

                    $maxIds = $settingsService->getLimit('max_shared_with');
                    $ids = array_slice($ids, 0, $maxIds);

                    $users = \App\Models\User::query()
                        ->whereIn('id', $ids)
                        ->get(['id', 'name', 'email']);

                    return response()->json(['success' => true, 'data' => $users]);
                })->name('by-ids');

                Route::get('/{user}/shared', [TrainingLogController::class, 'shared'])
                    ->name('shared')
                    ->where('user', '[0-9]+');
            });
        });
    });

// ============================================================================
// 🏢 7. COMPANIES & CHANNELS API
// ============================================================================

// Публичный доступ для управления (требует auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('social-media-links', [SocialMediaLinkController::class, 'store']);
    Route::put('social-media-links/{id}', [SocialMediaLinkController::class, 'update']);
    Route::delete('social-media-links/{id}', [SocialMediaLinkController::class, 'destroy']);
    Route::post('social-media-links/reorder', [SocialMediaLinkController::class, 'reorder']);
});

// COMPANIES
Route::get('/companies/meta/total', [CompanyController::class, 'count']);
Route::apiResource('companies', CompanyController::class)->where(['company' => '[0-9]+']);

// CHANNELS
Route::get('/channels/meta/total', [ContactChannelController::class, 'count'])->name('api.channels.count');
Route::get('/channels', [ContactChannelController::class, 'index'])->name('api.channels.index');
Route::get('/channels/sync', [ContactChannelController::class, 'sync'])->name('api.channels.sync');
Route::put('/channels/reorder', [ContactChannelController::class, 'reorder'])->name('api.channels.reorder');
Route::get('/channels/{contactChannel}', [ContactChannelController::class, 'show'])->name('api.channels.show');
Route::post('/channels', [ContactChannelController::class, 'store'])->name('api.channels.store');
Route::put('/channels/{contactChannel}', [ContactChannelController::class, 'update'])->name('api.channels.update');
Route::delete('/channels/{contactChannel}', [ContactChannelController::class, 'destroy'])->name('api.channels.destroy');

// CHANNELS BY COMPANY
Route::prefix('companies/{company}')->group(function () {
    Route::get('/contact-channels', [ContactChannelController::class, 'indexByCompany'])->name('api.companies.channels.indexByCompany');
    Route::post('/contact-channels', [ContactChannelController::class, 'store'])->name('api.companies.channels.store');
    Route::put('/contact-channels/reorder', [ContactChannelController::class, 'reorder'])->name('api.companies.channels.reorder');
    Route::get('/contact-channels/{contactChannel}', [ContactChannelController::class, 'show'])->name('api.companies.channels.show');
    Route::put('/contact-channels/{contactChannel}', [ContactChannelController::class, 'update'])->name('api.companies.channels.update');
    Route::delete('/contact-channels/{contactChannel}', [ContactChannelController::class, 'destroy'])->name('api.companies.channels.destroy');
});

// ============================================================================
// 8. Landing Pages API
// ============================================================================
Route::prefix('landing')->group(function () {

    // ✅ ПУБЛИЧНЫЕ маршруты (БЕЗ авторизации)
    Route::get('/public', [LandingPageController::class, 'publicIndex'])
        ->name('api.landing.public.index');

    Route::get('/public/{slug}', [LandingPageController::class, 'publicShow'])
        ->name('api.landing.public');

    // ✅ ЗАЩИЩЁННЫЕ маршруты (требуют auth:sanctum)
    Route::middleware('auth:sanctum')->group(function () {

        // CRUD лендингов
        Route::get('/pages', [LandingPageController::class, 'index'])
            ->name('api.landing.pages.index');
        Route::get('/pages/{page}', [LandingPageController::class, 'show'])
            ->name('api.landing.pages.show');
        Route::post('/pages', [LandingPageController::class, 'store'])
            ->name('api.landing.pages.store');
        Route::put('/pages/{page}', [LandingPageController::class, 'update'])
            ->name('api.landing.pages.update');
        Route::delete('/pages/{page}', [LandingPageController::class, 'destroy'])
            ->name('api.landing.pages.destroy');
        Route::post('/pages/{page}/publish', [LandingPageController::class, 'publish'])
            ->name('api.landing.pages.publish');

        // ✅ Настройки режима сайта — ИСПРАВЛЕНО!
        Route::prefix('settings')->name('api.landing.settings.')->group(function () {
            // GET — получить текущий режим
            Route::get('/public-mode', [SiteSettingsController::class, 'getPublicMode'])
                ->name('public-mode.get');

            // POST — обновить режим (полные настройки)
            Route::post('/public-mode', [SiteSettingsController::class, 'updatePublicMode'])
                ->name('public-mode.update');

            // POST — переключить режим (maintenance/landing/production)
            Route::post('/switch/{mode}', [SiteSettingsController::class, 'switchMode'])
                ->name('public-mode.switch')
                ->where('mode', 'maintenance|landing|production');
        });
    });
});

// ============================================================================
// 🔧 9. ОТЛАДОЧНЫЕ МАРШРУТЫ
// ============================================================================
Route::get('/debug/network', function(Request $request) {
    $dbConnected = false;
    $redisConnected = false;
    try {
        $dbConnected = DB::connection()->getPdo() ? true : false;
    } catch (\Exception $e) {
        \Log::error("DB Connection Error: " . $e->getMessage());
    }

    try {
        $redisConnected = Redis::connection()->ping() === true;
    } catch (\Exception $e) {
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
