<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
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
        return response()->json(['status' => 'CSRF cookie set'])
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

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('fenix_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        return responseSuccess();
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
