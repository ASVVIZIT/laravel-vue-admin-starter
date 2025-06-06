<?php

use App\Models\Acl;
use Illuminate\Contracts\Routing\Registrar as RouteContract;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('Api')->group(function() {
    Route::post('auth/login', 'AuthController@login');
    Route::group(['middleware' => 'auth:sanctum'], function () {
        Route::post('auth/logout', 'AuthController@logout');

        Route::get('/user', 'AuthController@user');

        // Api resource routes
        Route::apiResource('roles', 'RoleController')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
        Route::apiResource('users', 'UserController')->middleware('permission:' . Acl::PERMISSION_USER_MANAGE);
        Route::apiResource('permissions', 'PermissionController')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);

        // Custom routes
        Route::group(['prefix' => 'users'], function (RouteContract $api) {
            $api->get('{user}/permissions', 'UserController@permissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
            $api->put('{user}/permissions', 'UserController@updatePermissions')->middleware('permission:' .Acl::PERMISSION_PERMISSION_MANAGE);
            $api->get('{user}/logs', 'LogController@index');
        });

        Route::get('roles/{role}/permissions', 'RoleController@permissions')->middleware('permission:' . Acl::PERMISSION_PERMISSION_MANAGE);
        Route::get('requests', 'RequestController@index');

        Route::prefix('entities')->group(function () {
            Route::apiResource('ep_brands', \App\Http\Controllers\Api\Entity\BrandController::class);
            Route::apiResource('ep_device_types', \App\Http\Controllers\Api\Entity\DeviceTypeController::class);

            Route::get('ep_measurement_categories/all', [\App\Http\Controllers\Api\Entity\MeasurementCategoryController::class, 'all'])->name('ep_measurement_categories.all');
            Route::apiResource('ep_measurement_categories', \App\Http\Controllers\Api\Entity\MeasurementCategoryController::class)->only(['index']);
            Route::apiResource('ep_measurement_units', \App\Http\Controllers\Api\Entity\MeasurementUnitController::class);
            Route::apiResource('ep_accessories', \App\Http\Controllers\Api\Entity\AccessoryController::class);
        })->middleware('permission:' . Acl::PERMISSION_ENTITY_MANAGE);
    });
});

Route::prefix('table')->group(function () {
    Route::get('templates/{id}', [App\Http\Controllers\Api\TemplateController::class, 'show']);
    Route::get('rows', [App\Http\Controllers\Api\TableRowController::class, 'index']);
});

/*// Роуты для брендов
Route::get('api/ep/brands', [BrandController::class, 'index'])->name('brands.index');
Route::post('api/ep/brands', [BrandController::class, 'store'])->name('brands.store');

Route::group(['prefix' => 'api/ep/brands/{brand}'], function () {
    Route::get('/', [BrandController::class, 'show'])->name('brands.show');
    Route::put('/', [BrandController::class, 'update'])->name('brands.update');
    Route::delete('/', [BrandController::class, 'destroy'])->name('brands.destroy');
});

// Роуты для автоматических выключателей
Route::get('api/ep/circuit-breakers', [CircuitBreakerController::class, 'index'])->name('circuit-breakers.index');
Route::post('api/ep/circuit-breakers', [CircuitBreakerController::class, 'store'])->name('circuit-breakers.store');

Route::group(['prefix' => 'api/ep/circuit-breakers/{circuit_breaker}'], function () {
    Route::get('/', [CircuitBreakerController::class, 'show'])->name('circuit-breakers.show');
    Route::put('/', [CircuitBreakerController::class, 'update'])->name('circuit-breakers.update');
    Route::delete('/', [CircuitBreakerController::class, 'destroy'])->name('circuit-breakers.destroy');
});*/

/*Route::apiResources([
    'brands' => App\Http\Controllers\Api\BrandController::class,
    'circuit-breakers' => App\Http\Controllers\Api\CircuitBreakerController::class,
    'rcds' => App\Http\Controllers\Api\RCDController::class,
    'cables' => App\Http\Controllers\Api\CableController::class
]);*/

Route::get('/orders', function () {
    $rowsNumber = 8;
    $data = [];
    for ($rowIndex = 0; $rowIndex < $rowsNumber; $rowIndex++) {
        $row = [
            'order_no' => 'LARAVUE' . mt_rand(1000000, 9999999),
            'price' => mt_rand(10000, 999999),
            'status' => randomInArray(['success', 'pending']),
        ];
        $data[] = $row;
    }
    return responseSuccess(['items' => $data]);
});
