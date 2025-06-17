<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Проверка параметра запроса (например: ?lang=en)
        if ($request->has('lang')) {
            $locale = $request->get('lang');
            session()->put('locale', $locale);
        }

        // 2. Проверка сохраненной локали в сессии
        $locale = session()->get('locale');

        // 3. Проверка локали пользователя из настроек (если есть аутентификация)
        if (auth()->check() && $userLocale = auth()->user()->locale) {
            $locale = $userLocale;
        }

        // 4. Использование локали из конфига
        if (empty($locale)) {
            $locale = config('app.locale');
        }

        // Установка локали
        App::setLocale($locale);

        return $next($request);
    }
}
