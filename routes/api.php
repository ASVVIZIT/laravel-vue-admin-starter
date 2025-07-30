<?php

use App\Models\Acl;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Contracts\Routing\Registrar as RouteContract;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserTabController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\TesterController;

use App\Http\Controllers\Api\Entity\BrandController;
use App\Http\Controllers\Api\Entity\DeviceTypeController;
use App\Http\Controllers\Api\Entity\MeasurementCategoryController;
use App\Http\Controllers\Api\Entity\MeasurementUnitController;
use App\Http\Controllers\Api\Entity\AccessoryController;

use App\Http\Controllers\TalkStream\ContactController;
use App\Http\Controllers\TalkStream\ChatController;
use App\Http\Controllers\TalkStream\CallController;
use App\Http\Controllers\TalkStream\FriendRequestController;
use App\Http\Controllers\Video\VideoController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\TableRowController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Основные группы маршрутов:
| 1. Аутентификация (включая админскую и тестовую)
| 2. Пользовательские маршруты (требуют аутентификации)
| 3. TalkStream (чат и звонки)
| 4. Видео-функционал
| 5. Дополнительные сервисы
|
| Все маршруты защищены соответствующими middleware
*/

// ===================================================
// 1. Маршруты аутентификации
// ===================================================

// Админский вход (не требует аутентификации)
Route::prefix('admin')->group(function () {
    Route::post('auth/login', [AdminAuthController::class, 'login']);
});

// Тестовый вход (только для не-production окружения)
Route::prefix('tester')->middleware('is_testing')->group(function () {
    Route::post('login/{role}', [TesterController::class, 'login']);
});

// Основные маршруты аутентификации
Route::namespace('Api')->group(function() {

    // CSRF-защита для Sanctum
    Route::get('/sanctum/csrf-cookie', [AuthController::class, 'csrf']);

    // Обычный вход с защитой от IP-блокировок
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('ip.banned');

    // Группа защищенных маршрутов (требуют аутентификации)
    Route::middleware('auth:sanctum')->group(function () {

        // Верификация email
        Route::post('/email/resend', [AuthController::class, 'resendVerification']);
        Route::get('/email/verify', [AuthController::class, 'checkVerification']);

        // Управление сессиями
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Информация о пользователе
        Route::get('/user', [AuthController::class, 'user']);

        // Пользовательские вкладки
        Route::get('/user-tabs', [UserTabController::class, 'index']);
        Route::post('/user-tabs', [UserTabController::class, 'store']);
        Route::put('/user-tabs/{userTab}', [UserTabController::class, 'update']);
        Route::delete('/user-tabs/{userTab}', [UserTabController::class, 'destroy']);

        // Управление ролями и разрешениями
        Route::apiResource('roles', 'RoleController')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
        Route::apiResource('users', 'UserController')->middleware('permission:' . Acl::PERMISSION_USER_MANAGE);
        Route::apiResource('permissions', 'PermissionController')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);

        // Кастомные маршруты для пользователей
        Route::prefix('users')->group(function (RouteContract $api) {
            $api->get('{user}/permissions', 'UserController@permissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
            $api->put('{user}/permissions', 'UserController@updatePermissions')->middleware('permission:' .Acl::PERMISSION_PERMISSION_MANAGE);
            $api->get('{user}/logs', 'LogController@index');
        });

        // Маршруты для ролей
        Route::get('roles/{role}/permissions', 'RoleController@permissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
        Route::get('requests', 'RequestController@index');

        // Сущности системы
        Route::prefix('entities')->middleware('permission:' . Acl::PERMISSION_ENTITY_MANAGE)->group(function () {
            Route::apiResource('ep_brands', BrandController::class);
            Route::apiResource('ep_device_types', DeviceTypeController::class);
            Route::get('ep_measurement_categories/all', [MeasurementCategoryController::class, 'all'])->name('ep_measurement_categories.all');
            Route::apiResource('ep_measurement_categories', MeasurementCategoryController::class)->only(['index']);
            Route::apiResource('ep_measurement_units', MeasurementUnitController::class);
            Route::apiResource('ep_accessories', AccessoryController::class);
        });
    });
});

// ===================================================
// 2. Маршруты TalkStream (чат и коммуникации)
// ===================================================
Route::namespace('Api')->group(function() {
    // Повторная CSRF-защита (для совместимости)
    Route::get('/sanctum/csrf-cookie', [AuthController::class, 'csrf']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // Аутентификация для broadcasting
    Route::post('/broadcasting/auth', function (Request $request) {
        return Broadcast::auth($request);
    })->middleware(['auth:sanctum']);

    // Защищенные маршруты TalkStream
    Route::middleware('auth:sanctum')->group(function () {
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
                Route::post('/start', [CallController::class, 'startCall']);
                Route::post('/end', [CallController::class, 'endCall']);
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
    });
});

// ===================================================
// 3. Отладочные и сервисные маршруты
// ===================================================
Route::get('/debug/network', function(Request $request) {
    return response()->json([
        'client_ip' => $request->ip(),
        'headers' => $request->headers->all(),
        'server' => $_SERVER,
        'connections' => [
            'database' => DB::connection()->getPdo() ? true : false,
            'redis' => Redis::connection()->ping() === true
        ]
    ]);
});

// ===================================================
// 4. Видео-функционал
// ===================================================
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/file-list', [VideoController::class, 'getFileList']);
Route::get('/videos/scan-single', [VideoController::class, 'scanSingleFile']);
Route::post('/videos/scan-multiple', [VideoController::class, 'scanMultipleFiles']);

// Статические видео-файлы
Route::get('/video-files/{filename}', function ($filename) {
    $path = storage_path('/Videos/videos/' . $filename);

    if (!file_exists($path)) abort(404);

    $mimeTypes = [
        'webm' => 'video/webm',
        'mp4' => 'video/mp4',
        'mov' => 'video/quicktime',
        'avi' => 'video/x-msvideo'
    ];

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mime = $mimeTypes[$ext] ?? 'video/webm';

    return response()->file($path, [
        'Content-Type' => $mime,
        'Cache-Control' => 'public, max-age=31536000'
    ]);
})->where('filename', '.*');

// ===================================================
// 5. Таблицы и данные
// ===================================================
Route::prefix('table')->group(function () {
    Route::get('templates/{id}', [TemplateController::class, 'show']);
    Route::get('rows', [TableRowController::class, 'index']);
});

// ===================================================
// 6. Демо-данные (тестовые заказы)
// ===================================================
Route::get('/orders', function () {
    $rowsNumber = 8;
    $data = [];
    for ($rowIndex = 0; $rowIndex < $rowsNumber; $rowIndex++) {
        $row = [
            'order_no' => 'LARAVUE' . mt_rand(1000000, 9999999),
            'price' => mt_rand(10000, 999999),
            'status' => ['success', 'pending'][rand(0, 1)],
        ];
        $data[] = $row;
    }
    return response()->json(['items' => $data]);
});

// ===================================================
// Регистрация middleware для роутов
// ===================================================
App::booted(function() {
    // Блокировка по IP (после 5 неудачных попыток)
    Route::aliasMiddleware('ip.banned', \App\Http\Middleware\CheckIpBanned::class);

    // Ограничение тестового режима (только не-production)
    Route::aliasMiddleware('is_testing', \App\Http\Middleware\IsTestingEnvironment::class);
});
