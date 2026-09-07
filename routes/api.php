<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

use App\Models\Acl;
use App\Http\Controllers\Api\I18nScannerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\TesterController;
use App\Http\Controllers\Api\UserTabController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\ReferenceController;
use App\Http\Controllers\Api\TableRowController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\LogController;
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
use App\Http\Controllers\Api\SmartLight\DeviceSettingsController;
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

/*
|--------------------------------------------------------------------------
| API Routes — FenixPortal
|--------------------------------------------------------------------------
*/

// ============================================================================
// 1. ПУБЛИЧНЫЕ API (Без авторизации)
// ============================================================================

Route::get('social-media-links', [SocialMediaLinkController::class, 'index']);

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

Route::get('/orders', function () {
    $rowsNumber = 22;
    $data = [];
    for ($rowIndex = 0; $rowIndex < $rowsNumber; $rowIndex++) {
        $data[] = [
            'order_no' => 'LARAVUE ' . mt_rand(1000000, 9999999),
            'price' => mt_rand(10000, 999999),
            'status' => randomInArray(['success', 'pending', 'error']),
        ];
    }
    return responseSuccess(['items' => $data]);
});

// ============================================================================
// 2. АУТЕНТИФИКАЦИЯ (Публичные эндпоинты)
// ============================================================================

Route::prefix('admin')->group(function () {
    Route::post('auth/login', [AdminAuthController::class, 'login']);
});

Route::prefix('tester')->middleware('is_testing')->group(function () {
    Route::post('login/{role}', [TesterController::class, 'login']);
});

Route::get('/auth/config', [AuthController::class, 'getConfig']);
Route::get('/sanctum/csrf-cookie', [AuthController::class, 'csrf']);
Route::post('auth/login', [AuthController::class, 'login'])->middleware('ip.banned');
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/auth/restore/{id}/{hash}', [AuthController::class, 'restoreAccount']);
Route::match(['get', 'post'], '/auth/verify-email/{id}/{hash}', [AuthController::class, 'verify'])->name('verification.verify');


// ============================================================================
// 3. ПОЛЬЗОВАТЕЛИ (Users)
// ============================================================================

// 3.1. ПУБЛИЧНЫЕ: Подтверждение смены email (БЕЗ auth:sanctum, БЕЗ user_id)
// Токен самодостаточен — ищем пользователя через User::where('pending_email_token', $token)
Route::prefix('users')->group(function () {
    Route::get('/confirm-old-email/{token}', [UserController::class, 'confirmOldEmail']);
    Route::get('/confirm-new-email/{token}', [UserController::class, 'confirmNewEmail']);
});

// 3.2. ЗАЩИЩЕННЫЕ: Действия пользователя со своим аккаунтом
Route::prefix('users')->middleware('auth:sanctum')->group(function () {
    Route::post('/{user}/request-email-change', [UserController::class, 'requestEmailChange']);
    Route::post('/{user}/reverify-email', [UserController::class, 'requestEmailReverification']);
});

// 3.3. ЗАЩИЩЕННЫЕ: Административное управление пользователями
Route::prefix('users')->middleware(['auth:sanctum', 'permission:' . Acl::PERMISSION_USER_MANAGE])->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);

    // {user} → {id} для работы с soft-deleted
    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
    Route::post('/{id}/restore', [UserController::class, 'restore']);
    Route::post('/{id}/ban', [UserController::class, 'ban']);
    Route::post('/{id}/unban', [UserController::class, 'unban']);
    Route::get('/{id}/permissions', [UserController::class, 'permissions']);
    Route::put('/{id}/permissions', [UserController::class, 'updatePermissions']);
    Route::get('/{id}/logs', [LogController::class, 'index']);

    // Администраторское подтверждение смены email
    Route::post('/{id}/admin-confirm-old-email', [UserController::class, 'adminConfirmOldEmail']);
    Route::post('/{id}/admin-confirm-new-email', [UserController::class, 'adminConfirmNewEmail']);
    Route::post('/{id}/resend-new-email-confirmation', [UserController::class, 'resendNewEmailConfirmation']);
});


// ============================================================================
// 4. РОЛИ И ПРАВА (Roles & Permissions)
// ============================================================================
Route::middleware(['auth:sanctum', 'permission:' . Acl::PERMISSION_PERMISSION_MANAGE])->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class);
});


// ============================================================================
// 5. СПРАВОЧНИКИ И ВКЛАДКИ (References & Tabs)
// ============================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('/user-tabs', UserTabController::class);
    Route::apiResource('templates', TemplateController::class);
    Route::apiResource('table-rows', TableRowController::class);

    Route::prefix('references')->group(function () {
        Route::get('types', [ReferenceController::class, 'getTypes']);
        Route::get('{modelName}', [ReferenceController::class, 'getData']);
        Route::get('{modelName}/info', [ReferenceController::class, 'getFieldInfo']);
    });

    // Проверка и управление своей сессией
    Route::get('/auth/verification/check', [AuthController::class, 'checkVerification']);
    Route::post('/auth/verification/resend', [AuthController::class, 'resendVerification']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});


// ============================================================================
// 6. СУЩНОСТИ (Entities)
// ============================================================================
Route::prefix('entities')->middleware(['auth:sanctum', 'permission:' . Acl::PERMISSION_ENTITY_MANAGE])->group(function () {
    Route::apiResource('ep_brands', BrandController::class);
    Route::apiResource('ep_device_types', DeviceTypeController::class);
    Route::get('ep_measurement_categories/all', [MeasurementCategoryController::class, 'all'])->name('ep_measurement_categories.all');
    Route::apiResource('ep_measurement_categories', MeasurementCategoryController::class)->only(['index']);
    Route::apiResource('ep_measurement_units', MeasurementUnitController::class);
    Route::apiResource('ep_accessories', AccessoryController::class);
});


// ============================================================================
// 7. TALKSTREAM (Чаты, звонки, друзья)
// ============================================================================
Route::prefix('talkstream')->middleware('auth:sanctum')->group(function () {
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
        Route::post('/end-call', [CallController::class, 'endCall']); // Исправлен дублирующийся '/end' на '/end-call'
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


// ============================================================================
// 8. ВИДЕО (Video)
// ============================================================================
// Публичные дубли (как было в оригинале)
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/file-list', [VideoController::class, 'getFileList']);
Route::get('/videos/scan-single', [VideoController::class, 'scanSingleFile']);
Route::post('/videos/scan-multiple', [VideoController::class, 'scanMultipleFiles']);

// Защищенные (если нужны внутри админки)
Route::prefix('video')->middleware('auth:sanctum')->group(function () {
    Route::get('/index', [VideoController::class, 'index']);
    Route::get('/file-list', [VideoController::class, 'getFileList']);
    Route::get('/scan-single', [VideoController::class, 'scanSingleFile']);
    Route::post('/scan-multiple', [VideoController::class, 'scanMultipleFiles']);
});


// ============================================================================
// 9. SMARTLIGHT API
// ============================================================================
Route::prefix('smart-light')->name('smart-light.')->group(function () {

    // Публичная регистрация устройства
    Route::post('/register', [CoreControllers\CoreDeviceController::class, 'register'])->name('register');

    // Аутентификация самого устройства (а не пользователя)
    Route::middleware(SmartLightDeviceAuth::class)->group(function () {
        Route::post('/{device_id}/telemetry', [CoreControllers\CoreTelemetryController::class, 'store'])->name('telemetry.store');
        Route::get('/{device_id}/telemetry', [CoreControllers\CoreTelemetryController::class, 'index'])->name('telemetry.index');
        Route::get('/{device_id}/commands', [CoreControllers\CoreCommandController::class, 'getPending'])->name('commands.pending');
        Route::get('/{device_id}/settings/device-auth', [CoreControllers\CoreDeviceSettingsController::class, 'getForDeviceAuth'])->name('settings.device-auth');
        Route::get('/{device_id}/settings', [CoreControllers\CoreDeviceController::class, 'getLegacySettings'])->name('settings.legacy')->middleware('deprecated');
    });

    // Управление устройствами от имени авторизованного пользователя
    Route::middleware('auth:sanctum')->group(function () {
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

        Route::prefix('devices/{device_id}/settings')->name('devices.settings.')->group(function () {
            Route::get('/', [CoreControllers\CoreDeviceSettingsController::class, 'show'])->name('show');
            Route::put('/', [CoreControllers\CoreDeviceSettingsController::class, 'update'])->name('update');
            Route::post('/reset', [CoreControllers\CoreDeviceSettingsController::class, 'reset'])->name('reset');
            Route::get('/defaults', [CoreControllers\CoreDeviceSettingsController::class, 'getDefaults'])->name('defaults');
        });

        Route::get('/battery-types', [CoreControllers\CoreTypesController::class, 'batteryTypes'])->name('battery-types.index');
        Route::get('/bulb-types', [CoreControllers\CoreTypesController::class, 'bulbTypes'])->name('bulb-types.index');
        Route::get('/power-supplies', [CoreControllers\CoreTypesController::class, 'powerSupplies'])->name('power-supplies.index');
        Route::get('/settings', [CoreControllers\CoreSettingsController::class, 'index'])->name('global-settings.index');
        Route::post('/settings', [CoreControllers\CoreSettingsController::class, 'update'])->name('global-settings.update');
        Route::post('/settings/reset', [CoreControllers\CoreSettingsController::class, 'reset'])->name('global-settings.reset');

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

        Route::prefix('v1')->name('v1.')->group(function () {
            Route::apiResource('devices', V1Controllers\V1DeviceController::class)->only(['index', 'show', 'update', 'destroy'])->parameters(['devices' => 'device_id']);
            Route::post('/devices/{device_id}/commands/sleep', [V1Controllers\V1CommandController::class, 'sleep'])->name('commands.sleep');
            Route::post('/devices/{device_id}/commands/wake', [V1Controllers\V1CommandController::class, 'wake'])->name('commands.wake');
            Route::post('/devices/{device_id}/commands/status', [V1Controllers\V1CommandController::class, 'status'])->name('commands.status');
            Route::apiResource('devices.settings', V1Controllers\V1DeviceSettingsController::class)->only(['show', 'update'])->parameters(['settings' => 'device_id']);
            Route::apiResource('battery-types', V1Controllers\V1TypesController::class)->only(['index', 'show'])->parameters(['battery-types' => 'battery_type_id']);
            Route::apiResource('bulb-types', V1Controllers\V1TypesController::class)->only(['index', 'show'])->parameters(['bulb-types' => 'bulb_type_id']);
            Route::apiResource('power-supplies', V1Controllers\V1TypesController::class)->only(['index', 'show'])->parameters(['power-supplies' => 'power_supply_id']);
        });
    });
});


// ============================================================================
// 10. TRAINING API
// ============================================================================
Route::prefix('training')->name('training.')->group(function () {
    // Публичный список упражнений
    Route::get('/exercises', [ExerciseController::class, 'index'])->name('exercises.index');

    // Защищенные действия с тренировками
    Route::middleware('auth:sanctum')->group(function () {
        Route::prefix('logs')->name('logs.')->group(function () {
            Route::get('/', [TrainingLogController::class, 'index'])->name('index');
            Route::post('/', [TrainingLogController::class, 'store'])->name('store');
            Route::put('/{log}', [TrainingLogController::class, 'update'])->name('update');
            Route::delete('/{log}', [TrainingLogController::class, 'destroy'])->name('destroy');
        });

        Route::get('/logs/grouped', [TrainingLogController::class, 'grouped'])->name('logs.grouped');

        Route::prefix('logs/{log}')->name('logs.')->group(function () {
            Route::post('/restore', [TrainingLogController::class, 'restore'])->name('restore');
            Route::delete('/force', [TrainingLogController::class, 'forceDelete'])->name('force');
        });

        Route::prefix('stats')->name('stats.')->group(function () {
            Route::get('/', [TrainingLogController::class, 'stats'])->name('index');
            Route::get('/summary', [TrainingLogController::class, 'summary'])->name('summary');
        });

        Route::prefix('export')->name('export.')->group(function () {
            Route::get('/csv', [TrainingExportController::class, 'exportCsv'])->name('csv');
        });

        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [TrainingSettingsController::class, 'index'])->name('index');
            Route::put('/', [TrainingSettingsController::class, 'update'])->name('update');
        });

        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/search', function (Request $request, \App\Services\Training\TrainingSettingsService $settingsService) {
                $search = $request->get('search', '');
                $minLength = $settingsService->getLimit('search_min_length');
                if (strlen($search) < $minLength) return response()->json(['success' => true, 'data' => []]);

                $users = \App\Models\User::query()
                    ->where(fn($q) => $q->where('name', 'LIKE', "%{$search}%")->orWhere('email', 'LIKE', "%{$search}%"))
                    ->where('id', '!=', auth()->id())
                    ->limit($settingsService->getLimit('search_results_limit'))
                    ->get(['id', 'name', 'email']);
                return response()->json(['success' => true, 'data' => $users]);
            })->name('search');

            Route::get('/by-ids', function (Request $request, \App\Services\Training\TrainingSettingsService $settingsService) {
                $ids = array_filter(array_map('intval', explode(',', $request->get('ids', ''))));
                if (empty($ids)) return response()->json(['success' => true, 'data' => []]);

                $users = \App\Models\User::query()
                    ->whereIn('id', array_slice($ids, 0, $settingsService->getLimit('max_shared_with')))
                    ->get(['id', 'name', 'email']);
                return response()->json(['success' => true, 'data' => $users]);
            })->name('by-ids');

            Route::get('/{user}/shared', [TrainingLogController::class, 'shared'])->name('shared')->where('user', '[0-9]+');
        });
    });
});


// ============================================================================
// 11. COMPANIES & CHANNELS API
// ============================================================================
// Публичные мета-данные и списки
Route::get('/companies/meta/total', [CompanyController::class, 'count']);
Route::apiResource('companies', CompanyController::class)->where(['company' => '[0-9]+']);
Route::get('/channels/meta/total', [ContactChannelController::class, 'count'])->name('api.channels.count');
Route::get('/channels', [ContactChannelController::class, 'index'])->name('api.channels.index');
Route::get('/channels/sync', [ContactChannelController::class, 'sync'])->name('api.channels.sync');
Route::get('/channels/{contactChannel}', [ContactChannelController::class, 'show'])->name('api.channels.show');

// Защищенные действия
Route::middleware('auth:sanctum')->group(function () {
    Route::post('social-media-links', [SocialMediaLinkController::class, 'store']);
    Route::put('social-media-links/{id}', [SocialMediaLinkController::class, 'update']);
    Route::delete('social-media-links/{id}', [SocialMediaLinkController::class, 'destroy']);
    Route::post('social-media-links/reorder', [SocialMediaLinkController::class, 'reorder']);

    Route::put('/channels/reorder', [ContactChannelController::class, 'reorder'])->name('api.channels.reorder');
    Route::post('/channels', [ContactChannelController::class, 'store'])->name('api.channels.store');
    Route::put('/channels/{contactChannel}', [ContactChannelController::class, 'update'])->name('api.channels.update');
    Route::delete('/channels/{contactChannel}', [ContactChannelController::class, 'destroy'])->name('api.channels.destroy');

    Route::prefix('companies/{company}')->group(function () {
        Route::get('/contact-channels', [ContactChannelController::class, 'indexByCompany'])->name('api.companies.channels.indexByCompany');
        Route::post('/contact-channels', [ContactChannelController::class, 'store'])->name('api.companies.channels.store');
        Route::put('/contact-channels/reorder', [ContactChannelController::class, 'reorder'])->name('api.companies.channels.reorder');
        Route::get('/contact-channels/{contactChannel}', [ContactChannelController::class, 'show'])->name('api.companies.channels.show');
        Route::put('/contact-channels/{contactChannel}', [ContactChannelController::class, 'update'])->name('api.companies.channels.update');
        Route::delete('/contact-channels/{contactChannel}', [ContactChannelController::class, 'destroy'])->name('api.companies.channels.destroy');
    });
});


// ============================================================================
// 12. LANDING PAGES API
// ============================================================================
Route::prefix('landing')->group(function () {
    // Публичные страницы
    Route::get('/public', [LandingPageController::class, 'publicIndex'])->name('api.landing.public.index');
    Route::get('/public/{slug}', [LandingPageController::class, 'publicShow'])->name('api.landing.public');

    // Административное управление
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/pages/list', [LandingPageController::class, 'listForSelector'])->name('api.landing.pages.list');
        Route::get('/pages', [LandingPageController::class, 'index'])->name('api.landing.pages.index');
        Route::get('/pages/{page}', [LandingPageController::class, 'show'])->name('api.landing.pages.show');
        Route::post('/pages', [LandingPageController::class, 'store'])->name('api.landing.pages.store');
        Route::put('/pages/{page}', [LandingPageController::class, 'update'])->name('api.landing.pages.update');
        Route::delete('/pages/{page}', [LandingPageController::class, 'destroy'])->name('api.landing.pages.destroy');
        Route::post('/pages/{page}/publish', [LandingPageController::class, 'publish'])->name('api.landing.pages.publish');

        Route::prefix('settings')->name('api.landing.settings.')->group(function () {
            Route::get('/public-mode', [SiteSettingsController::class, 'getPublicMode'])->name('public-mode.get');
            Route::post('/public-mode', [SiteSettingsController::class, 'updatePublicMode'])->name('public-mode.update');
            Route::post('/switch/{mode}', [SiteSettingsController::class, 'switchMode'])->name('public-mode.switch')->where('mode', 'maintenance|landing|production|preview');
            Route::post('/maintenance-html', [SiteSettingsController::class, 'updateMaintenanceHtml'])->name('maintenance-html.update');
        });
    });
});


// ============================================================================
// 13. ОТЛАДОЧНЫЕ МАРШРУТЫ И BROADCASTING
// ============================================================================
Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware(['auth:sanctum']);

Route::get('/debug/network', function(Request $request) {
    $dbConnected = false;
    $redisConnected = false;
    try { $dbConnected = DB::connection()->getPdo() ? true : false; }
    catch (\Exception $e) { Log::error("DB Connection Error: " . $e->getMessage()); }

    try { $redisConnected = Redis::connection()->ping() === true; }
    catch (\Exception $e) { Log::error("Redis Connection Error: " . $e->getMessage()); }

    return response()->json([
        'client_ip' => $request->ip(),
        'headers' => $request->headers->all(),
        'server' => $_SERVER,
        'connections' => ['database' => $dbConnected, 'redis' => $redisConnected],
    ]);
});


// ============================================================================
// 14. I18N SCANNER
// ============================================================================
Route::middleware(['auth:sanctum'])->prefix('i18n')->name('i18n.')->group(function () {
    Route::get('/languages', [I18nScannerController::class, 'getAvailableLanguages'])->name('languages');
    Route::get('/scan', [I18nScannerController::class, 'scan'])->name('scan')->middleware('throttle:10,1');
    Route::get('/keys', [I18nScannerController::class, 'getKeys'])->name('keys')->middleware('throttle:30,1');
    Route::get('/translations/{lang}', [I18nScannerController::class, 'getTranslations'])->name('translations')->middleware('throttle:30,1');
    Route::get('/validate-paths', [I18nScannerController::class, 'validatePaths'])->name('validate-paths')->middleware('throttle:10,1');
});
