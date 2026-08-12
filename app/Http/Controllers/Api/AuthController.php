<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\UserResource;
use App\Models\Acl;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Notifications\RestoreAccountNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response as ResponseStatus;

/**
 * Контроллер аутентификации и управления пользователями
 *
 * Обрабатывает: CSRF, вход, выход, регистрацию, подтверждение email,
 * восстановление пароля, восстановление удалённых аккаунтов (SoftDeletes).
 *
 * 🔒 Принципы безопасности:
 * - Одинаковые ответы в forgot-password (анти-enumeration)
 * - SoftDeletes блокирует email — повторная регистрация невозможна
 * - Владелец удалённой учётки может восстановить её через "Забыли пароль"
 */
class AuthController extends BaseController
{
    // ========================================================================
    // 🛡️ CSRF И СЕССИЯ
    // ========================================================================

    /**
     * Получить CSRF-токен и инициализировать сессию
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function csrf(Request $request): JsonResponse
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

    // ========================================================================
    // 🔐 АУТЕНТИФИКАЦИЯ (ВХОД/ВЫХОД)
    // ========================================================================

    /**
     * Аутентификация пользователя
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $ipAddress = $request->ip() ?? 'unknown';

        // Проверка блокировки IP
        $banRecord = LoginAttempt::where('ip_address', $ipAddress)
            ->where('is_banned', true)
            ->first();

        if ($banRecord) {
            return response()->json(['error' => 'Ваш IP заблокирован'], ResponseStatus::HTTP_FORBIDDEN);
        }

        // Валидация
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), ResponseStatus::HTTP_UNPROCESSABLE_ENTITY);
        }

        $credentials = $request->only('email', 'password');

        // Попытка входа
        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Authentication failed'], ResponseStatus::HTTP_UNAUTHORIZED);
            }

            // Запись успешной попытки
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
        }

        // Запись неудачной попытки
        LoginAttempt::recordAttempt(
            $ipAddress,
            $request->input('email', ''),
            $request->userAgent() ?? '',
            false
        );

        // Проверка лимита попыток
        $failedAttemptsCount = LoginAttempt::where('ip_address', $ipAddress)
            ->where('created_at', '>', now()->subMinutes(15))
            ->count();

        if ($failedAttemptsCount >= 5) {
            LoginAttempt::where('ip_address', $ipAddress)->update(['is_banned' => true]);
            return response()->json(['error' => 'Ваш IP заблокирован'], ResponseStatus::HTTP_FORBIDDEN);
        }

        return response()->json(['error' => 'Неверные учётные данные'], ResponseStatus::HTTP_UNAUTHORIZED);
    }

    /**
     * Выход из системы
     *
     * @param Request $request
     * @return JsonResponse
     */
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

    /**
     * Инвалидация сессии и logout
     *
     * @param Request $request
     * @return void
     */
    private function invalidateSession(Request $request): void
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    // ========================================================================
    // 👤 ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ
    // ========================================================================

    /**
     * Получить информацию о текущем пользователе
     *
     * @param Request $request
     * @return UserResource
     */
    public function user(Request $request): UserResource
    {
        $user = $request->user();
        if (!$user) {
            abort(ResponseStatus::HTTP_UNAUTHORIZED, 'Unauthenticated');
        }
        return new UserResource($user);
    }

    // ========================================================================
    // ⚙️ КОНФИГУРАЦИЯ
    // ========================================================================

    /**
     * Получить конфигурацию авторизации для фронта
     *
     * @return JsonResponse
     */
    public function getConfig(): JsonResponse
    {
        $defaultType = config('auth.default_login_type', 'admin');
        $validTypes = config('auth.valid_login_types', ['user', 'admin', 'tester']);

        if (!is_array($validTypes) || !in_array($defaultType, $validTypes, true)) {
            $defaultType = 'admin';
        }

        return response()->json([
            'token_storage_mode' => config('auth.token_storage_mode', 'cookie'),
            'valid_login_types' => is_array($validTypes) ? $validTypes : ['user', 'admin', 'tester'],
            'default_login_type' => $defaultType,
        ]);
    }

    // ========================================================================
    // 📝 РЕГИСТРАЦИЯ
    // ========================================================================

    /**
     * Регистрация нового пользователя
     *
     * 🔒 Валидация `unique:users` включает SoftDeleted — повторная
     * регистрация на email удалённой учётки ЗАПРЕЩЕНА.
     * Владелец может восстановить учётку через "Забыли пароль".
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), ResponseStatus::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $user = User::create([
                'name' => $request->input('name', ''),
                'email' => $request->input('email', ''),
                'password' => Hash::make($request->input('password', ''))
            ]);
        } catch (\Throwable $e) {
            Log::error('[Register] Ошибка создания пользователя', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Не удалось создать пользователя'], ResponseStatus::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Назначаем роль user по умолчанию
        try {
            $user->assignRole(Acl::ROLE_USER);
        } catch (\Throwable $e) {
            Log::warning('[Register] Роль user не назначена', ['error' => $e->getMessage()]);
        }

        // Отправляем письмо подтверждения
        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            Log::error('[Register] Ошибка отправки письма верификации', ['error' => $e->getMessage()]);
        }

        // Создаём токен для фронта
        $token = $user->createToken('fenix-token')->plainTextToken;

        return response()->json([
            'message' => 'Регистрация успешна. Проверьте почту.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
            'token_storage_mode' => config('auth.token_storage_mode', 'cookie'),
        ]);
    }

    // ========================================================================
    // ✉️ ПОДТВЕРЖДЕНИЕ EMAIL
    // ========================================================================

    /**
     * Подтверждение email по ссылке из письма
     * GET|POST /api/auth/verify-email/{id}/{hash}
     *
     * @param Request $request
     * @param int $id
     * @param string $hash
     * @return JsonResponse|RedirectResponse
     */
    public function verify(Request $request, int $id, string $hash): JsonResponse|RedirectResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->verifyResponse($request, false, 'Пользователь не найден');
        }

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return $this->verifyResponse($request, false, 'Неверная ссылка подтверждения');
        }

        if (!$user->hasVerifiedEmail()) {
            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
            }
        }

        return $this->verifyResponse($request, true, 'Email успешно подтверждён');
    }

    /**
     * Проверка статуса верификации email
     * GET /api/auth/verification/check
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkVerification(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'verified' => $user ? $user->hasVerifiedEmail() : false
        ]);
    }

    /**
     * Повторная отправка письма верификации
     * POST /api/auth/verification/resend
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], ResponseStatus::HTTP_UNAUTHORIZED);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email уже подтвержден']);
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            Log::error('[ResendVerification] Ошибка отправки письма', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Не удалось отправить письмо'], ResponseStatus::HTTP_INTERNAL_SERVER_ERROR);
        }

        return response()->json(['message' => 'Ссылка отправлена']);
    }

    /**
     * Формирование ответа верификации
     * JSON для API, редирект для браузера (клик из письма)
     *
     * @param Request $request
     * @param bool $ok
     * @param string $message
     * @return JsonResponse|RedirectResponse
     */
    private function verifyResponse(Request $request, bool $ok, string $message): JsonResponse|RedirectResponse
    {
        // Клик из письма (GET из браузера) — редиректим на SPA-вход
        if ($request->method() === 'GET' && !$request->expectsJson()) {
            return redirect('/user/login?verified=' . ($ok ? '1' : '0'));
        }

        return response()->json([
            'message' => $message,
            'verified' => $ok,
        ], $ok ? ResponseStatus::HTTP_OK : ResponseStatus::HTTP_BAD_REQUEST);
    }

    // ========================================================================
    // 🔑 ВОССТАНОВЛЕНИЕ ПАРОЛЯ + ВОССТАНОВЛЕНИЕ УДАЛЁННОЙ УЧЁТКИ
    // ========================================================================

    /**
     * Запрос сброса пароля ИЛИ восстановления удалённой учётки
     * POST /api/auth/forgot-password
     *
     * 🔒 Анти-enumeration: ВСЕГДА возвращает одинаковый ответ
     * независимо от существования email в базе.
     *
     * Логика:
     * 1. Активный пользователь → письмо со ссылкой сброса пароля
     * 2. SoftDeleted пользователь → письмо со ссылкой ВОССТАНОВЛЕНИЯ учётки
     * 3. Email не существует → ничего не шлём, но ответ тот же
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), ResponseStatus::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Безопасный ответ — одинаковый для всех случаев
        $safeResponse = ['message' => 'Если аккаунт существует в нашей базе данных, владелец получит письмо с инструкциями.'];

        try {
            // 🔥 Ищем ВКЛЮЧАЯ удалённых (SoftDeletes)
            $trashedUser = User::onlyTrashed()->where('email', $request->input('email'))->first();

            if ($trashedUser) {
                // Учётка в корзине → шлём ссылку ВОССТАНОВЛЕНИЯ
                $trashedUser->notify(new RestoreAccountNotification());
                Log::info('[ForgotPassword] Отправлена ссылка восстановления', ['email' => $request->input('email')]);
            } else {
                // Активный пользователь или email не существует → обычный сброс
                $status = Password::sendResetLink($request->only('email'));
                Log::info('[ForgotPassword] Статус отправки', [
                    'email' => $request->input('email'),
                    'status' => $status,
                ]);
            }
        } catch (\Throwable $e) {
            // Логируем, но не раскрываем ошибку пользователю
            Log::error('[ForgotPassword] Ошибка', [
                'email' => $request->input('email'),
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json($safeResponse);
    }

    /**
     * Установка нового пароля по токену из письма
     * POST /api/auth/reset-password
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), ResponseStatus::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function (User $user, string $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json(['message' => 'Пароль успешно изменён']);
            }

            return response()->json(['error' => 'Не удалось сбросить пароль. Ссылка устарела или неверна.'], ResponseStatus::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Throwable $e) {
            Log::error('[ResetPassword] Ошибка сброса пароля', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ошибка сброса пароля'], ResponseStatus::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Восстановление удалённой учётки по ссылке из письма
     * GET /api/auth/restore/{id}/{hash}
     *
     * Владелец кликает по ссылке в письме RestoreAccountNotification →
     * учётка восстанавливается (restore) → редирект на установку нового пароля.
     *
     * @param Request $request
     * @param int $id
     * @param string $hash
     * @return RedirectResponse
     */
    public function restoreAccount(Request $request, int $id, string $hash): RedirectResponse
    {
        // Ищем ВКЛЮЧАЯ удалённых
        $user = User::withTrashed()->find($id);

        // Неверная ссылка → редирект на логин с ошибкой (не раскрываем данные)
        if (!$user || !hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect('/user/login?restore=failed');
        }

        // Если учётка уже активна — просто отправляем ставить пароль
        if (!$user->trashed()) {
            Log::info('[Restore] Учётка уже активна, редирект на сброс пароля', ['user_id' => $user->id]);
            return $this->redirectToReset($user);
        }

        // 🔥 ВОССТАНОВЛЕНИЕ из корзины
        try {
            $user->restore();
            Log::info('[Restore] Учётка восстановлена', ['user_id' => $user->id]);
        } catch (\Throwable $e) {
            Log::error('[Restore] Ошибка восстановления', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return redirect('/user/login?restore=failed');
        }

        return $this->redirectToReset($user->fresh());
    }

    /**
     * После восстановления — сразу на установку нового пароля
     * Создаём токен сброса через Password broker и редиректим на форму
     *
     * @param User $user
     * @return RedirectResponse
     */
    private function redirectToReset(User $user): RedirectResponse
    {
        $token = Password::broker()->createToken($user);

        return redirect('/user/reset-password'
            . '?token=' . urlencode($token)
            . '&email=' . urlencode($user->email));
    }
}
