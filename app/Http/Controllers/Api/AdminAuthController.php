<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $admins = config('auth.admin_users', []);

        foreach ($admins as $admin) {
            if ($request->email === $admin['email'] &&
                $request->password === $admin['password']) {

                $user = User::find($admin['id']);

                if (!$user) {
                    return response()->json(['error' => 'Пользователь не найден'], 404);
                }

                // Проверка роли
                if (!$user->hasRole('admin')) {
                    return response()->json(['error' => 'Доступ запрещен'], 403);
                }

                $token = $user->createToken('admin-token', ['admin'])->plainTextToken;

                return response()->json([
                    'token' => $token,
                    'user' => $user
                ]);
            }
        }

        return response()->json(['error' => 'Неверные учетные данные'], 401);
    }
}
