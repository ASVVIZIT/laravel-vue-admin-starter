<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $hardcoded = config('auth.admin_users', [
            [
                'email' => 'admin@test.com',
                'password' => 'secret',
                'id' => 1
            ]
        ]);

        foreach ($hardcoded as $admin) {
            if ($admin['email'] === $request->email &&
                $admin['password'] === $request->password) {

                $user = User::find($admin['id']);
                $token = $user->createToken('admin-token', ['admin'])->plainTextToken;

                return response()->json([
                    'token' => $token,
                    'user' => $user
                ]);
            }
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }
}
