<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PermissionResource;
use App\Http\Resources\UserResource;
use App\Models\Acl;
use App\Models\Log;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Class UserController
 *
 * @package App\Http\Controllers\Api
 */
class UserController extends BaseController
{
    /**
     * Display a listing of the user resource.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Валидация параметров
            $params = $request->all();
            $validator = Validator::make($params, [
                'per_page' => 'nullable|integer|min:1|max:300',
                'current_page' => 'nullable|integer|min:1',
                'role' => 'nullable|string',
                'search' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return $this->sendValidationError($validator->errors());
            }

            // Построение запроса
            $query = User::with('roles')
                ->when(!empty($params['role']), function (Builder $query) use ($params) {
                    $query->whereHas('roles', function ($q) use ($params) {
                        $q->where('name', $params['role']);
                    });
                })
                ->when(!empty($params['search']), function (Builder $query) use ($params) {
                    $query->where(function ($q) use ($params) {
                        $q->where('name', 'like', '%' . $params['search'] . '%')
                            ->orWhere('email', 'like', '%' . $params['search'] . '%');
                    });
                });

            // Пагинация
            $users = $query->paginate(
                $params['per_page'] ?? 10,
                ['*'],
                'page',
                $params['page'] ?? 1
            );

            // Успешный ответ
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
            // Ошибка базы данных
            Log::error('UserController DB Error: ' . $e->getMessage(), [
                'params' => $params,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->sendDatabaseError($e);

        } catch (\Exception $e) {
            // Непредвиденная ошибка
            Log::error('UserController Server Error: ' . $e->getMessage(), [
                'params' => $params,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->sendServerError($e);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            array_merge(
                $this->getValidationRules(),
                [
                    'password' => ['required', 'min:6'],
                    'confirmPassword' => 'same:password',
                ]
            )
        );

        if ($validator->fails()) {
            return responseFailed($validator->errors()->first(), Response::HTTP_BAD_REQUEST);
        } else {
            try {
                $params = $request->all();
                DB::beginTransaction();
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
                $loginUser = Auth::user();

                Log::query()->create([
                    'user_id' => $user->id,
                    'operator_id' => $loginUser->id,
                    'title' => 'Create',
                    'content' => "Created by {$loginUser->name}({$loginUser->email})"
                ]);
                DB::commit();

                return new UserResource($user);
            } catch (\Exception $ex) {
                DB::rollBack();
                return responseFailed($ex->getMessage());
            }
        }
    }

    /**
     * Display the specified resource.
     *
     * @param User $user
     * @return UserResource|\Illuminate\Http\JsonResponse
     */
    public function show(User $user): UserResource
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param User $user
     * @return UserResource|\Illuminate\Http\JsonResponse
     */
    public function update(Request $request, User $user): UserResource
    {
        if ($user === null) {
            return response()->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $currentUser = Auth::user();
        if (!$currentUser->isAdmin()
            && $currentUser->id !== $user->id
            && !$currentUser->hasPermission(Acl::PERMISSION_USER_MANAGE)
        ) {
            return response()->json(['error' => 'Permission denied'], Response::HTTP_BAD_REQUEST);
        }

        $validator = Validator::make($request->all(), $this->getValidationRules(false));
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 403);
        }

        $user->name = $request->input('name');
        $user->sex = intval($request->input('sex'));
        $user->birthday = $request->input('birthday');
        $user->description = $request->input('description');
        $user->save();
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param User $user
     * @return UserResource|\Illuminate\Http\JsonResponse
     */
    public function updatePermissions(Request $request, User $user): UserResource
    {
        if (empty($user)) {
            return responseFailed('User not found', Response::HTTP_NOT_FOUND);
        }

        if ($user->isAdmin()) {
            return responseFailed('Admin can not be modified', Response::HTTP_BAD_REQUEST);
        }

        $permissionIds = $request->get('permissions', []);
        $rolePermissionIds = array_map(
            function ($permission) {
                return $permission['id'];
            },

            $user->getPermissionsViaRoles()->toArray()
        );

        $newPermissionIds = array_diff($permissionIds, $rolePermissionIds);
        $permissions = Permission::allowed()->whereIn('id', $newPermissionIds)->get();
        $user->syncPermissions($permissions);
        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param User $user
     */
    public function destroy(User $user)
    {
        if ($user->isAdmin()) {
            return responseFailed('Ehhh! Can not delete admin user', Response::HTTP_FORBIDDEN);
        }

        try {
            $currentUser = Auth::user();
    /*        dd([
                '$currentUser' => $currentUser->getAuthIdentifier(),
                '$user' => $user->getAuthIdentifier(),
            ]);*/

            if ($currentUser->getAuthIdentifier() === $user->getAuthIdentifier()) {
                return responseFailed('Can not delete - Its ure', Response::HTTP_NOT_MODIFIED);
            } else {
                $user->delete();
            }
        } catch (\Exception $ex) {
            return responseFailed($ex->getMessage(), Response::HTTP_FORBIDDEN);
        }

        return responseSuccess();
    }

    /**
     * Get permissions from role
     *
     * @param User $user
     */
    public function permissions(User $user)
    {
        try {
            return responseSuccess([
                'user' => PermissionResource::collection($user->getDirectPermissions()),
                'role' => PermissionResource::collection($user->getPermissionsViaRoles()),
            ]);
        } catch (\Exception $ex) {
            return responseFailed($ex->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @param bool $isNew
     * @return array
     */
    private function getValidationRules(bool $isNew = true): array
    {
        return [
            'name' => $isNew ? 'required|unique:users' : '',
            'email' => $isNew ? 'required|email|unique:users' : '',
            'role' => $isNew ? [
                'required',
                Rule::notIn([Acl::ROLE_ADMIN])
            ] : '',
            'sex' => [
                'required',
                Rule::in([0, 1])
            ],
            'birthday' => 'date_format:Y-m-d H:i:s',
            'description' => 'max:255'
        ];
    }
}
