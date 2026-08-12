<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PermissionResource;
use App\Http\Resources\UserResource;
use App\Models\Acl;
use App\Models\Log as LogModel;
use App\Models\LoginAttempt;
use App\Models\Permission;
use App\Models\Role;
use App\Models\TalkStream\FriendRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class UserController extends BaseController
{
    // ========================================================================
    // 📋 1. СПИСОК И ПРОСМОТР
    // ========================================================================

    public function index(Request $request): JsonResponse
    {
        $params = $request->all();

        try {
            $validator = Validator::make($params, [
                'per_page' => 'nullable|integer|min:1|max:300',
                'current_page' => 'nullable|integer|min:1',
                'role' => 'nullable|array',
                'role.*' => 'string|exists:roles,name',
                'search' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:all,active,banned,trashed,unverified',
            ]);

            if ($validator->fails()) {
                return $this->sendValidationError($validator->errors());
            }

            $query = User::withTrashed()->with('roles')
                ->when(!empty($params['role']), function (Builder $query) use ($params) {
                    $query->whereHas('roles', fn($q) => $q->whereIn('name', (array) $params['role']));
                })
                ->when(!empty($params['search']), function (Builder $query) use ($params) {
                    $query->where(fn($q) => $q->where('name', 'like', '%' . $params['search'] . '%')
                        ->orWhere('email', 'like', '%' . $params['search'] . '%'));
                })
                ->when(!empty($params['status']) && $params['status'] !== 'all', function (Builder $query) use ($params) {
                    match ($params['status']) {
                        'trashed' => $query->onlyTrashed(),
                        'banned' => $query->whereIn('email', LoginAttempt::where('is_banned', true)->pluck('email'))->whereNull('deleted_at'),
                        'unverified' => $query->whereNull('email_verified_at')->whereNull('deleted_at'),
                        'active' => $query->whereNull('deleted_at')
                            ->whereNotNull('email_verified_at')
                            ->whereNotIn('email', LoginAttempt::where('is_banned', true)->pluck('email')),
                        default => $query,
                    };
                });

            $users = $query->orderBy('created_at', 'desc')->paginate(
                $params['per_page'] ?? 10,
                ['*'],
                'page',
                $params['page'] ?? 1
            );

            return response()->json([
                'success' => true,
                'items' => UserResource::collection($users),
                'meta' => [
                    'total' => $users->total(),
                    'page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'last_page' => $users->lastPage(),
                ]
            ]);
        } catch (QueryException $e) {
            Log::error('UserController DB Error: ' . $e->getMessage(), ['params' => $params, 'trace' => $e->getTraceAsString()]);
            return $this->sendDatabaseError($e);
        } catch (\Exception $e) {
            Log::error('UserController Server Error: ' . $e->getMessage(), ['params' => $params, 'trace' => $e->getTraceAsString()]);
            return $this->sendServerError($e);
        }
    }

    public function show($id)
    {
        try {
            $user = User::withTrashed()->with('roles')->findOrFail($id);
            return new UserResource($user);
        } catch (ModelNotFoundException $e) {
            Log::warning('[UserController::show] User not found', ['id' => $id]);
            return response()->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            Log::error('[UserController::show] Error', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // ========================================================================
    // ➕ 2. СОЗДАНИЕ И ОБНОВЛЕНИЕ
    // ========================================================================

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), array_merge($this->getValidationRules(), [
            'password' => ['required', 'min:6'],
            'confirmPassword' => 'same:password',
        ]));

        if ($validator->fails()) {
            return responseFailed($validator->errors()->first(), Response::HTTP_BAD_REQUEST);
        }

        try {
            DB::beginTransaction();
            $params = $request->all();

            $user = User::create([
                'name' => $params['name'],
                'email' => $params['email'],
                'password' => Hash::make($params['password']),
                'sex' => $params['sex'],
                'birthday' => $params['birthday'] ?? null,
                'description' => $params['description'] ?? ''
            ]);

            $role = Role::findByName($params['role']);
            $user->syncRoles($role);

            $this->auditLog($user->id, 'Create', "Created by " . Auth::user()->name . " (" . Auth::user()->email . ")");
            DB::commit();

            return new UserResource($user);
        } catch (\Exception $ex) {
            DB::rollBack();
            return responseFailed($ex->getMessage());
        }
    }

    public function update(Request $request, User $user)
    {
        $currentUser = Auth::user();
        if (!$currentUser->isAdmin() && $currentUser->id !== $user->id && !$currentUser->hasPermission(Acl::PERMISSION_USER_MANAGE)) {
            return response()->json(['error' => 'Permission denied'], Response::HTTP_FORBIDDEN);
        }

        $validator = Validator::make($request->all(), $this->getValidationRules(false));
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->name = $request->input('name');
        $user->sex = intval($request->input('sex'));
        $user->birthday = $request->input('birthday');
        $user->description = $request->input('description');
        $user->save();

        return new UserResource($user);
    }

    // ========================================================================
    // 🔐 3. ПРАВА ДОСТУПА
    // ========================================================================

    public function updatePermissions(Request $request, User $user)
    {
        if ($user->isAdmin()) {
            return responseFailed('Admin can not be modified', Response::HTTP_BAD_REQUEST);
        }

        $permissionIds = $request->get('permissions', []);
        $rolePermissionIds = $user->getPermissionsViaRoles()->pluck('id')->toArray();
        $newPermissionIds = array_diff($permissionIds, $rolePermissionIds);

        $permissions = Permission::whereIn('id', $newPermissionIds)->get();
        $user->syncPermissions($permissions);

        return new UserResource($user);
    }

    public function permissions(User $user)
    {
        try {
            $rolePermissions = $user->getPermissionsViaRoles();
            $directPermissions = $user->getDirectPermissions();

            return responseSuccess([
                'user' => PermissionResource::collection($directPermissions),
                'role' => PermissionResource::collection($rolePermissions),
            ]);
        } catch (\Exception $ex) {
            Log::error('Error getting permissions: ' . $ex->getMessage());
            return responseFailed($ex->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // ========================================================================
    // 🗑 4. УДАЛЕНИЕ И ВОССТАНОВЛЕНИЕ
    // ========================================================================

    public function destroy(User $user)
    {
        if ($user->isAdmin()) {
            return responseFailed('Нельзя удалить администратора', Response::HTTP_FORBIDDEN);
        }
        if (Auth::id() === $user->id) {
            return responseFailed('Нельзя удалить себя', Response::HTTP_NOT_MODIFIED);
        }

        try {
            $user->delete();
            $this->auditLog($user->id, 'Delete', "Soft deleted by " . Auth::user()->email);
            return responseSuccess();
        } catch (\Exception $ex) {
            return responseFailed($ex->getMessage(), Response::HTTP_FORBIDDEN);
        }
    }

    public function restore($id): JsonResponse
    {
        try {
            $user = User::withTrashed()->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return responseFailed('Пользователь не найден', Response::HTTP_NOT_FOUND);
        }

        if (!$user->trashed()) {
            return responseFailed('Пользователь не удалён', Response::HTTP_BAD_REQUEST);
        }

        try {
            $user->restore();
            $this->auditLog($user->id, 'Restore', 'User restored by admin ' . Auth::user()->email);
            return responseSuccess(null, 'Пользователь восстановлен');
        } catch (\Exception $e) {
            Log::error('[UserController::restore] Error', ['user_id' => $id, 'error' => $e->getMessage()]);
            return responseFailed($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // ========================================================================
    // 🚫 5. БАН / РАЗБАН
    // ========================================================================

    public function ban(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return responseFailed('Нельзя забанить администратора', Response::HTTP_FORBIDDEN);
        }
        if ($user->trashed()) {
            return responseFailed('Нельзя забанить удалённого пользователя', Response::HTTP_BAD_REQUEST);
        }

        try {
            LoginAttempt::updateOrCreate(
                ['email' => $user->email],
                [
                    'ip_address' => 'admin_action',
                    'is_banned' => true,
                    'user_agent' => 'Admin ban action',
                    'attempts' => 0,
                    'last_attempt_at' => now(),
                ]
            );
            $this->auditLog($user->id, 'Ban', 'User banned by admin ' . Auth::user()->email);
            return responseSuccess(null, 'Пользователь забанен');
        } catch (\Exception $e) {
            Log::error('[UserController::ban] Error', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return responseFailed($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function unban(User $user): JsonResponse
    {
        try {
            LoginAttempt::where('email', $user->email)->update(['is_banned' => false]);
            $this->auditLog($user->id, 'Unban', 'User unbanned by admin ' . Auth::user()->email);
            return responseSuccess(null, 'Пользователь разбанен');
        } catch (\Exception $e) {
            Log::error('[UserController::unban] Error', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return responseFailed($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // ========================================================================
    // 📧 6. EMAIL И ВЕРИФИКАЦИЯ
    // ========================================================================

    public function requestEmailReverification(Request $request): JsonResponse
    {
        $user = $request->user();

        // Отправляем письмо (Laravel сам решит, это first-time или re-verification)
        $user->sendEmailVerificationNotification();

        $this->auditLog($user->id, 'Verification Requested', "Запрошено письмо для подтверждения email: {$user->email}");

        return responseSuccess(null, 'Письмо для подтверждения отправлено на вашу почту');
    }

    // ========================================================================
    // 💬 7. ПРОЧЕЕ
    // ========================================================================

    public function canTalk(Request $request, int $userId)
    {
        if (!FriendRequest::areFriends(Auth::id(), $userId)) {
            return response()->json(['error' => 'Вы не друзья'], Response::HTTP_FORBIDDEN);
        }
        return response()->json(['status' => 'OK']);
    }

    // ========================================================================
    // 🛠 8. ПРИВАТНЫЕ ХЕЛПЕРЫ
    // ========================================================================

    private function auditLog(int $userId, string $title, string $content): void
    {
        try {
            LogModel::query()->create([
                'user_id' => $userId,
                'operator_id' => Auth::id(),
                'title' => $title,
                'content' => $content,
            ]);
        } catch (\Throwable $e) {
            Log::warning('[UserController] Audit log failed', ['error' => $e->getMessage()]);
        }
    }

    private function getValidationRules(bool $isNew = true): array
    {
        return [
            'name' => $isNew ? 'required|unique:users' : 'required',
            'email' => $isNew ? 'required|email|unique:users' : 'required|email',
            'role' => $isNew ? ['required', Rule::notIn([Acl::ROLE_ADMIN, Acl::ROLE_SUPER_ADMIN])] : '',
            'sex' => ['required', Rule::in([0, 1])],
            'birthday' => 'nullable|date_format:Y-m-d H:i:s',
            'description' => 'nullable|max:255'
        ];
    }

    /**
     * Запрос на смену email (для конкретного пользователя)
     */
    public function requestEmailChange(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Проверка прав: пользователь может менять только свой email, либо админ с правом manage user может менять email другого
        if ($currentUser->id !== $user->id && !$currentUser->hasPermission(Acl::PERMISSION_USER_MANAGE)) {
            return responseFailed('Доступ запрещен', Response::HTTP_FORBIDDEN);
        }

        $validator = Validator::make($request->all(), [
            'new_email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return responseFailed($validator->errors()->first(), Response::HTTP_BAD_REQUEST);
        }

        $newEmail = strtolower(trim($request->input('new_email')));

        if (strtolower($user->email) === $newEmail) {
            return responseFailed('Новый email совпадает с текущим', Response::HTTP_BAD_REQUEST);
        }

        if (User::where('email', $newEmail)->exists()) {
            return responseFailed('Этот email уже используется другим пользователем', Response::HTTP_BAD_REQUEST);
        }

        if ($user->pending_new_email && $user->pending_email_expires_at && now()->lt($user->pending_email_expires_at)) {
            return responseFailed('У вас уже есть активный запрос на смену email', Response::HTTP_BAD_REQUEST);
        }

        try {
            $token = Str::random(64);

            $user->update([
                'pending_new_email' => $newEmail,
                'pending_email_token' => $token,
                'pending_email_expires_at' => now()->addHours(24),
                'old_email_confirmed' => false,
            ]);

            $confirmationUrl = config('app.url') . '/api/users/' . $user->id . '/confirm-old-email/' . $token;

            Log::info('[EmailChange] Подготовка к отправке (Raw)', [
                'user_id' => $user->id,
                'to' => $user->email,
                'url' => $confirmationUrl
            ]);

            Mail::raw(
                "Здравствуйте, {$user->name}!\n\n" .
                "Кто-то запросил смену email адреса для вашего аккаунта.\n" .
                "Текущий email: {$user->email}\n" .
                "Новый email: {$newEmail}\n\n" .
                "Если это были вы, подтвердите смену, перейдя по ссылке:\n" .
                $confirmationUrl . "\n\n" .
                "Если вы не запрашивали смену, просто проигнорируйте это письмо.",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->from('DillerASV@yandex.ru', 'FenixPortal') // <-- Убедись, что здесь правильный адрес отправителя!
                        ->subject('Подтверждение смены email');
                }
            );

            Log::info('[EmailChange] Письмо успешно отправлено (Raw)', ['user_id' => $user->id]);

            $this->auditLog($user->id, 'Email Change Requested', "Запрошена смена email на: {$newEmail}");

            return responseSuccess(null, 'Письмо для подтверждения отправлено на текущий email');

        } catch (\Exception $e) {
            Log::error('[EmailChange] Ошибка отправки письма', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return responseFailed($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Подтверждение на старом email
     */
    public function confirmOldEmail(User $user, string $token): JsonResponse
    {
        // Проверяем, что токен принадлежит именно этому пользователю
        if ($user->pending_email_token !== $token) {
            return responseFailed('Неверный токен', Response::HTTP_NOT_FOUND);
        }

        if (!$user->pending_email_expires_at || now()->gt($user->pending_email_expires_at)) {
            $user->update([
                'pending_new_email' => null,
                'pending_email_token' => null,
                'pending_email_expires_at' => null,
                'old_email_confirmed' => false,
            ]);
            return responseFailed('Ссылка устарела. Запросите смену email повторно', Response::HTTP_BAD_REQUEST);
        }

        $newToken = Str::random(64);
        $user->update([
            'old_email_confirmed' => true,
            'pending_email_token' => $newToken
        ]);

        $confirmationUrl = config('app.url') . '/api/users/' . $user->id . '/confirm-new-email/' . $newToken;

        Log::info('[EmailChange] Подготовка ко второму письму (Raw)', [
            'user_id' => $user->id,
            'to' => $user->pending_new_email,
            'url' => $confirmationUrl
        ]);

        Mail::raw(
            "Здравствуйте!\n\n" .
            "Ваш email был изменён на: {$user->pending_new_email}\n\n" .
            "Для завершения процесса, пожалуйста, подтвердите новый email, перейдя по ссылке:\n" .
            $confirmationUrl . "\n\n" .
            "Если вы не запрашивали смену email, срочно обратитесь в службу поддержки.",
            function ($message) use ($user) {
                $message->to($user->pending_new_email)
                    ->from('DillerASV@yandex.ru', 'FenixPortal')
                    ->subject('Подтверждение нового email');
            }
        );

        Log::info('[EmailChange] Второе письмо успешно отправлено (Raw)', ['user_id' => $user->id]);

        $this->auditLog($user->id, 'Old Email Confirmed', "Подтвержден старый email для смены на: {$user->pending_new_email}");

        return responseSuccess(null, 'Старый email подтвержден. Проверьте новый email для завершения.');
    }

    /**
     * Подтверждение на новом email (финальный шаг)
     */
    public function confirmNewEmail(User $user, string $token): JsonResponse
    {
        if ($user->pending_email_token !== $token) {
            return responseFailed('Неверный токен', Response::HTTP_NOT_FOUND);
        }

        if (!$user->pending_email_expires_at || now()->gt($user->pending_email_expires_at)) {
            $user->update([
                'pending_new_email' => null,
                'pending_email_token' => null,
                'pending_email_expires_at' => null,
                'old_email_confirmed' => false,
            ]);
            return responseFailed('Ссылка устарела. Запросите смену email повторно', Response::HTTP_BAD_REQUEST);
        }

        if (!$user->old_email_confirmed) {
            return responseFailed('Сначала подтвердите старый email', Response::HTTP_BAD_REQUEST);
        }

        $oldEmail = $user->email;
        $newEmail = $user->pending_new_email;

        $user->update([
            'email' => $newEmail,
            'email_verified_at' => null,
            'pending_new_email' => null,
            'pending_email_token' => null,
            'pending_email_expires_at' => null,
            'old_email_confirmed' => false,
        ]);

        $this->auditLog($user->id, 'Email Changed', "Email изменен с {$oldEmail} на {$newEmail}");

        return responseSuccess(null, 'Email успешно изменен! Теперь войдите с новым email.');
    }

    /**
     * Администраторское подтверждение старой почты
     */
    public function adminConfirmOldEmail(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->hasPermission(Acl::PERMISSION_CONFIRM_EMAIL)) {
            return responseFailed('Недостаточно прав', Response::HTTP_FORBIDDEN);
        }

        if (!$user->pending_new_email) {
            return responseFailed('Нет активного запроса на смену email', Response::HTTP_BAD_REQUEST);
        }

        if ($user->old_email_confirmed) {
            return responseFailed('Старая почта уже подтверждена', Response::HTTP_BAD_REQUEST);
        }

        $newToken = Str::random(64);
        $user->update([
            'old_email_confirmed' => true,
            'pending_email_token' => $newToken
        ]);

        $reason = $request->input('reason', 'Администраторское подтверждение (без указания причины)');
        $this->auditLog($user->id, 'Admin Email Old Confirmed',
            "Админ {$request->user()->email} подтвердил старую почту. Причина: {$reason}");

        return responseSuccess(null, 'Старая почта подтверждена администратором');
    }

    /**
     * Администраторское подтверждение новой почты (финальный шаг)
     */
    public function adminConfirmNewEmail(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->hasPermission(Acl::PERMISSION_CONFIRM_EMAIL)) {
            return responseFailed('Недостаточно прав', Response::HTTP_FORBIDDEN);
        }

        if (!$user->pending_new_email) {
            return responseFailed('Нет активного запроса на смену email', Response::HTTP_BAD_REQUEST);
        }

        if (!$user->old_email_confirmed) {
            return responseFailed('Сначала необходимо подтвердить старую почту', Response::HTTP_BAD_REQUEST);
        }

        $oldEmail = $user->email;
        $newEmail = $user->pending_new_email;

        $user->update([
            'email' => $newEmail,
            'email_verified_at' => now(), // Сразу верифицируем новый email
            'pending_new_email' => null,
            'pending_email_token' => null,
            'pending_email_expires_at' => null,
            'old_email_confirmed' => false,
        ]);

        $reason = $request->input('reason', 'Администраторское подтверждение (без указания причины)');
        $this->auditLog($user->id, 'Admin Email Changed',
            "Админ {$request->user()->email} завершил смену email с {$oldEmail} на {$newEmail}. Причина: {$reason}");

        return responseSuccess(null, 'Email успешно изменен администратором');
    }
}
