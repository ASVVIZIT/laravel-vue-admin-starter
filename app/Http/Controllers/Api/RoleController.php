<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

/**
 * Class RoleController
 *
 * @package App\Http\Controllers\Api
 */
class RoleController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
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



        $query = Role::query()->get();


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
            'items' => RoleResource::collection($users),
            'meta' => [
                'total' => $users->total(),
                'page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'last_page' => $users->lastPage(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param Role
     * @return \Illuminate\Http\Response
     */
    public function show(Role $role)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param Role $role
     * @return RoleResource|\Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Role $role)
    {
        if ($role === null || $role->isAdmin()) {
            return responseFailed('Role not found', Response::HTTP_NOT_FOUND);
        }

        $permissionIds = $request->get('permissions', []);
        $permissions = Permission::allowed()->whereIn('id', $permissionIds)->get();
        $role->syncPermissions($permissions);
        $role->save();
        return new RoleResource($role);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Get permissions from role
     *
     * @param Role $role
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function permissions(Role $role)
    {
        return PermissionResource::collection($role->permissions);
    }
}
