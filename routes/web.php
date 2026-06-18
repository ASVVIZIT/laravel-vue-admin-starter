<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SocialMediaLinks\SocialMediaLinkController;
use App\Http\Controllers\HomeController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// ============================================================================
// 🔐 SPA АДМИНКИ — ловим /admin/*, /user/*, /tester/*
// ============================================================================
// Все эти пути ведут к одному Vue SPA (index.blade.php)
// Vue сам определяет base path из URL

foreach (['admin', 'user', 'tester'] as $authType) {
    Route::prefix($authType)
        ->name("{$authType}.")
        ->group(function () {
            Route::get('/{any?}', function () {
                return view('index');
            })->where('any', '.*')->name('spa');
        });
}

// ============================================================================
// 📡 ПУБЛИЧНЫЕ API (без авторизации)
// ============================================================================
Route::get('social-media-links', [SocialMediaLinkController::class, 'index']);

// ============================================================================
// 🔧 СТАРЫЕ МАРШРУТЫ (для обратной совместимости)
// ============================================================================
Route::group(['middleware' => 'web'], function () {
    Route::get('home', [HomeController::class, 'index'])->name('home.legacy');
});

// ============================================================================
// 🌐 ПУБЛИЧНАЯ ЧАСТЬ — catch-all В САМОМ КОНЦЕ!
// ============================================================================
// Всё остальное (/, /about, /l/slug и т.д.) → публичный сайт
Route::get('/{any?}', function () {
    return view('public.home');
})->where('any', '.*')->name('public.spa');
