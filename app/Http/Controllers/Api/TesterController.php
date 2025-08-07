<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class TesterController extends Controller
{
    /**
     * Создает тестового пользователя и возвращает токен.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function loginAsTester(Request $request, $role = 'user')
    {
        // Проверка, что мы в тестовой среде (например, APP_ENV=local)
        // Эта проверка также должна быть в middleware IsTestingEnvironment
        if (app()->environment('production')) {
            return response()->json(['error' => 'Тестовый вход недоступен в production'], 403);
        }

        // Определяем данные для тестового пользователя
        $userData = [
            'name' => 'Tester ' . ucfirst($role),
            'email' => 'tester_' . $role . '_' . Str::random(5) . '@test.com',
            'password' => Hash::make('password'), // Обычный пароль для теста
            'email_verified_at' => now(), // Сразу верифицируем
            'is_test' => true, // Флаг тестового пользователя
        ];

        // Создаем или находим тестового пользователя
        $user = User::firstOrCreate(
            ['email' => $userData['email']], // Условие поиска
            $userData // Данные для создания, если не найден
        );

        // Назначаем роль, если используется Spatie
        if (method_exists($user, 'assignRole')) {
            // Убираем предыдущие роли
            $user->syncRoles([]);
            // Назначаем новую роль
            $user->assignRole($role);
        }

        // Создаем токен Sanctum для тестового пользователя
        $token = $user->createToken('tester-token')->plainTextToken;

        return response()->json([
            'message' => 'Тестовый пользователь создан и вошел в систему как ' . $role,
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
