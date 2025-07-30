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
use function csrf_token;
use function logger;
use function response;
use function responseSuccess;
use function session;

/**
 * Class AuthController
 *
 * @package App\Http\Controllers\Api
 */
class AuthController extends BaseController
{
    public function csrf(Request $request)
    {
        // Получаем или запускаем сессию
        $session = $request->session();

        if (!$session->isStarted()) {
            $session->start();
        }

        // Генерируем токен
        $token = csrf_token();

        // Отправляем его как куку
        return response()->json(['status' => 'OK'])
            ->withCookie(Cookie::make('XSRF-TOKEN', $token, 1440, null, null, false, false))
            ->withCookie(Cookie::make(
                'laravel_vue_admin_fenix_session',
                $session->getId(),
                1440,
                null,
                null,
                false,
                false,
                false,
                null,
                'None'
            ));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request)
    {

        // Временная отладка
        Log::debug('CSRF Token: ' . csrf_token());
        Log::debug('Session ID: ' . session()->getId());
        Log::debug('Cookies: ' . json_encode($request->cookies->all()));

        logger('Login attempt', [
            'email' => $request->email,
            'headers' => $request->headers->all(),
            'cookies' => $request->cookies->all(),
            'session_id' => session()->getId(),
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Неверные данные'], 422);
        }

        // Проверка IP-блокировки
        $ip = $request->ip();
        $attempt = LoginAttempt::firstOrCreate(['ip_address' => $ip]);

        if ($attempt->banned) {
            return response()->json(['error' => 'Ваш IP заблокирован'], 403);
        }

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Проверка верификации email
            if (!$user->hasVerifiedEmail()) {
                return response()->json(['error' => 'Email не подтвержден'], 403);
            }

            $token = $user->createToken('fenix_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        LoginAttempt::recordAttempt($ip, false);
        return response()->json(['message' => 'Неверные учетные данные'], 401);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        Auth::guard('web')->logout();
        return responseSuccess();
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->user());
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
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password)
        ]);

        $user->sendEmailVerificationNotification();
        return response()->json(['message' => 'Регистрация успешна. Проверьте почту.']);
    }

    public function resendVerification(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email уже подтвержден']);
        }

        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Ссылка отправлена']);
    }

    public function checkVerification(Request $request)
    {
        return response()->json([
            'verified' => $request->user()->hasVerifiedEmail()
        ]);
    }
}
