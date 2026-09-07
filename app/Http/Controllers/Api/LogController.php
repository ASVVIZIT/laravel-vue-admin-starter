<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\Response;

class LogController extends Controller
{
    /**
     * Таймлайн пользователя.
     * P0-ФИКС (trashed): ищем через withTrashed() — таймлайн открывается
     * и у soft-deleted пользователей (роут передаёт {id}, а не binding {user}).
     *
     * Роут: GET /users/{id}/logs
     */
    public function index(int $id)
    {
        $user = User::withTrashed()->find($id);

        if (empty($user)) {
            return responseFailed('User not found', Response::HTTP_NOT_FOUND);
        }

        $data = Log::query()
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate(10);

        return responseSuccess($data);
    }
}
