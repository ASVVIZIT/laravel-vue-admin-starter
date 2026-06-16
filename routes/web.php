<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Api\SocialMediaLinks\SocialMediaLinkController;
use App\Http\Controllers\HomeController; // ✅ Импортируем контроллер

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// ============================================================================
// 🔐 АДМИНКА — ПЕРЕД catch-all!
// ============================================================================
Route::prefix('admin')
    ->name('admin.')
    ->group(function () {
        // ✅ Просто отдаём SPA, без редиректа на хэш!
        Route::get('/{any?}', function () {
            return view('index');
        })->where('any', '.*')->name('spa');
    });

// ============================================================================
// 🌐 ПУБЛИЧНАЯ ЧАСТЬ — catch-all В КОНЦЕ!
// ============================================================================
Route::get('/{any?}', function () {
    return view('public.home');
})->where('any', '.*')->name('public.spa');

// ============================================================================
// 📡 ПУБЛИЧНЫЕ API (без авторизации)
// ============================================================================
Route::get('social-media-links', [SocialMediaLinkController::class, 'index']);

// ============================================================================
// 🔧 СТАРЫЕ МАРШРУТЫ (для обратной совместимости)
// ============================================================================
Route::group(['middleware' => 'web'], function () {
    // ✅ СОВРЕМЕННЫЙ синтаксис (Laravel 8+)
    Route::get('home', [HomeController::class, 'index'])->name('home.legacy');
});
