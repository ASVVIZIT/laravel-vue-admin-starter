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
        $validator = Validator::make($request->all(), [
            'per_page' => 'nullable|integer|min:1|max:300',
            'current_page' => 'nullable|integer|min:1',
            'role' => 'nullable|string',
            'search' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors());
        }

        // Создаем запрос без выполнения
        $query = Role::query();

        // Применяем фильтры
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Пагинация
        $perPage = $request->input('per_page', 10);
        $currentPage = $request->input('current_page', 1);
        $roles = $query->paginate($perPage, ['*'], 'page', $currentPage);

        // Успешный ответ
        return response()->json([
            'success' => true,
            'items' => RoleResource::collection($roles),
            'meta' => [
                'total' => $roles->total(),
                'current_page' => $roles->currentPage(),
                'per_page' => $roles->perPage(),
                'last_page' => $roles->lastPage(),
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
        if ($role->isAdmin()) {
            return response()->json(['error' => 'Cannot edit admin role'], 403);
        }

        $permissionIds = $request->get('permissions', []);
        $permissions = Permission::whereIn('id', $permissionIds)->get();
        $role->syncPermissions($permissions);
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
