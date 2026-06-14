<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SocialMediaLinks\SocialMediaLinkController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// ============================================================================
// 🌐 ПУБЛИЧНАЯ ЧАСТЬ (корень сайта)
// ============================================================================
Route::get('/', function () {
    return view('public.home');
})->name('public.home');

// ============================================================================
//  АДМИНКА (префикс /admin)
// ============================================================================
Route::prefix('admin')
    ->name('admin.')
    ->group(function () {
        // 🔥 Редирект с /admin на /admin/#/dashboard
        Route::get('/', function () {
            return redirect('/admin/#/dashboard');
        })->name('redirect');

        // Все маршруты админки → index.blade.php
        Route::get('/{any?}', function () {
            return view('index');
        })->where('any', '.*')->name('spa');
    });

// ============================================================================
// 📡 ПУБЛИЧНЫЕ API (без авторизации)
// ============================================================================
Route::get('social-media-links', [SocialMediaLinkController::class, 'index']);

// ============================================================================
// 🔧 СТАРЫЕ МАРШРУТЫ (для обратной совместимости)
// ============================================================================
Route::group(['middleware' => 'web'], function () {
    Route::get('home', 'HomeController@index')->name('home.legacy');
});
