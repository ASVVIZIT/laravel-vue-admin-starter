<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * Class AuthController
 *
 * @package App\Http\Controllers\Api
 */
class AuthController extends BaseController
{
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
