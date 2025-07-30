<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TesterController extends Controller
{
    public function login($role)
    {
        $user = $this->createTestUser($role);
        $token = $user->createToken('tester-token', [$role])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    private function createTestUser($role)
    {
        return User::create([
            'name' => "Test_$role_".Str::random(4),
            'email' => "test_{$role}_".Str::random(8).'@example.com',
            'password' => Hash::make(Str::random(16)),
            'role' => $role,
            'is_test' => true,
            'email_verified_at' => now()
        ]);
    }
}
