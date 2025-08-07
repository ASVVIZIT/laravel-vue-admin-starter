<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash; // Добавляем для хеширования пароля

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {

        // Проверка CSRF-токена
        if (!app()->environment('testing')) {
            $csrfToken = $request->header('X-XSRF-TOKEN');
            if (!$csrfToken || $csrfToken !== csrf_token()) {
                return response()->json(['error' => 'Invalid CSRF token'], 419);
            }
        }

        // Валидация входных данных
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        // Поиск администратора в конфиге
        $adminConfig = collect(config('auth.admin_users', []))
            ->firstWhere('email', $request->email);

        if (!$adminConfig || !Hash::check($request->password, $adminConfig['password'])) {
            return response()->json(['error' => 'Неверные учетные данные'], 401);
        }

        // Поиск администратора в конфиге
        $adminConfig = collect(config('auth.admin_users', []))
            ->firstWhere('email', $request->email);

        if (!$adminConfig || !Hash::check($request->password, $adminConfig['password'])) {
            return response()->json(['error' => 'Неверные учетные данные'], 401);
        }

        // Поиск пользователя в БД
        $user = User::find($adminConfig['id']);
        if (!$user) {
            return response()->json(['error' => 'Пользователь не найден'], 404);
        }

        // Проверка роли
        if (method_exists($user, 'hasRole') && !$user->hasRole('admin')) {
            return response()->json(['error' => 'Доступ запрещен'], 403);
        }

        // Аутентификация и генерация токена
        Auth::login($user);
        $token = $user->createToken('fenix-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
}
