<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\LoginAttempt;

class AuthController extends BaseController
{
    public function csrf(Request $request)
    {
        $session = $request->session();
        if (!$session || !$session->isStarted()) {
            $session?->start();
        }

        $token = csrf_token();

        return response()->json(['status' => 'OK'])
            ->withCookie(Cookie::make('XSRF-TOKEN', $token, 1440, null, null, false, false))
            ->withCookie(Cookie::make(
                'laravel_vue_admin_fenix_session',
                $session?->getId() ?? '',
                1440,
                null, null, false, false, false, null, 'None'
            ));
    }

    public function login(Request $request)
    {
        $ipAddress = $request->ip() ?? 'unknown';

        $banRecord = LoginAttempt::where('ip_address', $ipAddress)
            ->where('is_banned', true)
            ->first();

        if ($banRecord) {
            return response()->json(['error' => 'Ваш IP заблокирован'], 403);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Authentication failed'], 401);
            }

            LoginAttempt::recordAttempt(
                $ipAddress,
                $request->input('email', ''),
                $request->userAgent() ?? '',
                true
            );

            $token = $user->createToken('fenix-token')->plainTextToken;

            return response()->json([
                'message' => 'Успешный вход',
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
                'token_storage_mode' => config('auth.token_storage_mode', 'cookie'),
            ]);
        } else {
            LoginAttempt::recordAttempt(
                $ipAddress,
                $request->input('email', ''),
                $request->userAgent() ?? '',
                false
            );

            $failedAttemptsCount = LoginAttempt::where('ip_address', $ipAddress)
                ->where('created_at', '>', now()->subMinutes(15))
                ->count();

            if ($failedAttemptsCount >= 5) {
                LoginAttempt::where('ip_address', $ipAddress)->update(['is_banned' => true]);
                return response()->json(['error' => 'Ваш IP заблокирован'], 403);
            }

            return response()->json(['error' => 'Неверные учётные данные'], 401);
        }
    }

    public function getConfig(): JsonResponse
    {
        $defaultType = config('auth.default_login_type', 'admin');
        $validTypes = config('auth.valid_login_types', ['user', 'admin', 'tester']);

        // P0: Валидация дефолтного типа
        if (!is_array($validTypes) || !in_array($defaultType, $validTypes, true)) {
            $defaultType = 'admin';
        }

        return response()->json([
            'token_storage_mode' => config('auth.token_storage_mode', 'cookie'),
            'valid_login_types' => is_array($validTypes) ? $validTypes : ['user', 'admin', 'tester'],
            'default_login_type' => $defaultType,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            $this->invalidateSession($request);
            return response()->json(['message' => 'Вы не авторизованы']);
        }

        try {
            $currentToken = $user->currentAccessToken();

            if ($currentToken instanceof \Laravel\Sanctum\PersonalAccessToken) {
                $currentToken->delete();
                Log::info('[Auth] Удалён Bearer-токен', [
                    'user_id' => $user->id,
                    'token_id' => $currentToken->id ?? null,
                ]);
            } else {
                Log::info('[Auth] Cookie-сессия', ['user_id' => $user->id]);
            }
        } catch (\Throwable $e) {
            Log::warning('[Auth] Ошибка удаления токена', [
                'error' => $e->getMessage(),
            ]);
        }

        $this->invalidateSession($request);
        return response()->json(['message' => 'Успешный выход']);
    }

    private function invalidateSession(Request $request): void
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    public function user(Request $request): UserResource
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Unauthenticated');
        }
        return new UserResource($user);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->input('name', ''),
            'email' => $request->input('email', ''),
            'password' => bcrypt($request->input('password', ''))
        ]);

        $user->sendEmailVerificationNotification();
        return response()->json(['message' => 'Регистрация успешна. Проверьте почту.']);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email уже подтвержден']);
        }

        $user->sendEmailVerificationNotification();
        return response()->json(['message' => 'Ссылка отправлена']);
    }

    public function checkVerification(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'verified' => $user ? $user->hasVerifiedEmail() : false
        ]);
    }
}
