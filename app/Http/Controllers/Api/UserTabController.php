<?php

namespace App\Http\Controllers\Api;

use App\Models\UserTab;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class UserTabController extends BaseController
{
    /**
     * Получение списка вкладок пользователя.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        try {
            $user = Auth::user();
            $userTabs = $user->userTabs()->get();
            $formattedTabs = $userTabs->map(function ($tab) {
                return [
                    'id' => $tab->id,
                    'name' => $tab->tag_data['name'] ?? 'Нет имени',
                    'title' => $tab->tag_data['title'] ?? 'Нет заголовка',
                    'path' => $tab->path,
                    'fullPath' => $tab->tag_data['fullPath'] ?? $tab->path,
                    'meta' => [
                        'affix' => $tab->tag_data['meta']['affix'] ?? false,
                        'noCache' => $tab->tag_data['meta']['noCache'] ?? false,
                        'title' => $tab->tag_data['meta']['title'] ?? 'Нет заголовка',
                        'bootstrapIcon' => $tab->tag_data['meta']['bootstrapIcon'] ?? '',
                    ],
                ];
            });
            return response()->json(["data" => $formattedTabs]);
        } catch (\Exception $e) {
            Log::error('Error fetching user tabs: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch user tabs'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'path' => 'required|string|max:255',
            'tag_data' => 'required|array'
        ]);

        Log::info('Store request:', [
            'path' => $validated['path'],
            'tag_data' => $validated['tag_data'],
        ]);

        $user = Auth::user();
        $path = $validated['path'];

        if (empty($path)) {
            return response()->json(['message' => 'Поле path требуется.'], Response::HTTP_BAD_REQUEST);
        }

        $existingTab = $user->userTabs()->where('path', $path)->first();
        if ($existingTab) {
            return response()->json([
                'id' => $existingTab->id,
                'path' => $existingTab->path,
                'tag_data' => $existingTab->tag_data
            ], Response::HTTP_OK);
        }

        $userTab = $user->userTabs()->create([
            'path' => $path,
            'tag_data' => $validated['tag_data']
        ]);
        return response()->json([
            'id' => $userTab->id,
            'path' => $userTab->path,
            'tag_data' => $userTab->tag_data
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, UserTab $userTab): \Illuminate\Http\JsonResponse
    {
        // Проверка прав доступа с использованием политики (рекомендуется)
        $this->authorize('update', $userTab);

        // Валидация входных данных
        $validated = $request->validate([
            'tag_data' => 'required|array', // Обязательное поле
            'path' => 'sometimes|string|max:255', // Опциональное поле
        ]);

        // Логирование запроса
        Log::info('Update request for tab ' . $userTab->id, [
            'data' => $validated,
        ]);

        // Обновление данных
        $updateData = [
            'tag_data' => $validated['tag_data'],
        ];

        // Если передан новый `path`, проверяем его уникальность
        if (!empty($validated['path'])) {
            $newPath = $validated['path'];

            // Проверка уникальности `path` для текущего пользователя
            $existingTab = $userTab->user->userTabs()
                ->where('path', $newPath)
                ->where('id', '!=', $userTab->id)
                ->first();

            if ($existingTab) {
                return response()->json([
                    'message' => 'Путь уже существует для этого пользователя.'
                ], Response::HTTP_CONFLICT); // 409 Conflict
            }

            $updateData['path'] = $newPath;
        }

        // Обновляем запись в БД
        $userTab->update($updateData);

        // 📤 Возвращаем обновленные данные
        return response()->json(array_merge(
            $userTab->tag_data,
            ['id' => $userTab->id, 'path' => $userTab->path]
        ), Response::HTTP_OK); // 200 OK
    }

    public function destroy(UserTab $userTab)
    {
        if ($userTab->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        $userTab->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
