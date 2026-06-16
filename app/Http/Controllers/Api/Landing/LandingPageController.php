<?php

namespace App\Http\Controllers\Api\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\LandingPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LandingPageController extends Controller
{
    /**
     * GET /api/landing/pages
     * Список лендингов (требует авторизации)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LandingPage::query();

            // Фильтр по типу
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Фильтр по статусу публикации
            if ($request->filled('is_published')) {
                $query->where('is_published', filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN));
            }

            // Поиск по title/slug/description
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $pages = $query->orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            // Добавляем blocks_count вручную (blocks — JSON поле)
            $pages->getCollection()->transform(function ($page) {
                $page->blocks_count = is_array($page->blocks) ? count($page->blocks) : 0;
                return $page;
            });

            return response()->json([
                'data' => $pages->items(),
                'current_page' => $pages->currentPage(),
                'last_page' => $pages->lastPage(),
                'per_page' => $pages->perPage(),
                'total' => $pages->total(),
            ]);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@index] Ошибка', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ошибка загрузки списка лендингов'], 500);
        }
    }

    /**
     * GET /api/landing/pages/list
     * Список лендингов для селектора (ID, title, slug, type)
     */
    public function listForSelector(): JsonResponse
    {
        try {
            $pages = LandingPage::where('is_published', true)
                ->select('id', 'title', 'slug', 'type', 'published_at')
                ->orderBy('sort_order')
                ->get()
                ->map(function ($page) {
                    $data = $page->toArray();
                    $data['blocks_count'] = is_array($page->blocks) ? count($page->blocks) : 0;
                    return $data;
                });

            return response()->json($pages);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@listForSelector] Ошибка', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ошибка загрузки списка'], 500);
        }
    }

    /**
     * GET /api/landing/public
     * Публичный список опубликованных лендингов (БЕЗ авторизации)
     */
    public function publicIndex(): JsonResponse
    {
        try {
            $pages = LandingPage::published()
                ->orderBy('sort_order')
                ->orderBy('published_at', 'desc')
                ->get()
                ->map(function ($page) {
                    return [
                        'id' => $page->id,
                        'slug' => $page->slug,
                        'title' => $page->title,
                        'type' => $page->type,
                        'description' => $page->description,
                        'published_at' => $page->published_at?->toIso8601String(),
                        'blocks_count' => is_array($page->blocks) ? count($page->blocks) : 0,
                    ];
                });

            return response()->json($pages);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@publicIndex] Ошибка', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ошибка загрузки публичного списка'], 500);
        }
    }

    /**
     * GET /api/landing/pages/{id}
     * Получить лендинг по ID (требует авторизации)
     */
    public function show(LandingPage $page): JsonResponse
    {
        try {
            $data = $page->toArray();
            $data['blocks_count'] = is_array($page->blocks) ? count($page->blocks) : 0;

            return response()->json($data);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@show] Ошибка', [
                'page_id' => $page->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Ошибка загрузки лендинга'], 500);
        }
    }

    /**
     * POST /api/landing/pages
     * Создать лендинг (требует авторизации)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'slug' => 'required|string|unique:landing_pages,slug|max:255|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                'type' => 'sometimes|string|in:custom,personal_brand,shop,portfolio',
                'description' => 'nullable|string|max:1000',
                'settings' => 'nullable|array',
                'blocks' => 'nullable|array',
                'is_active' => 'boolean',
                'sort_order' => 'integer',
            ]);

            $validated['created_by'] = auth()->id();
            $validated['updated_by'] = auth()->id();

            $page = LandingPage::create($validated);

            return response()->json($page, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@store] Ошибка', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ошибка создания лендинга'], 500);
        }
    }

    /**
     * PUT /api/landing/pages/{id}
     * Обновить лендинг (требует авторизации)
     */
    public function update(Request $request, LandingPage $page): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'slug' => 'sometimes|required|string|unique:landing_pages,slug,' . $page->id . '|max:255|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                'type' => 'sometimes|string|in:custom,personal_brand,shop,portfolio',
                'description' => 'nullable|string|max:1000',
                'settings' => 'sometimes|array',
                'blocks' => 'sometimes|array',
                'is_active' => 'sometimes|boolean',
                'is_published' => 'sometimes|boolean',
                'sort_order' => 'sometimes|integer',
            ]);

            $validated['updated_by'] = auth()->id();

            // Если публикуют впервые — устанавливаем published_at
            if (isset($validated['is_published']) && $validated['is_published'] && !$page->published_at) {
                $validated['published_at'] = now();
            }

            // Если снимают с публикации — очищаем published_at
            if (isset($validated['is_published']) && !$validated['is_published']) {
                $validated['published_at'] = null;
            }

            $page->update($validated);

            return response()->json($page->fresh());

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@update] Ошибка', [
                'page_id' => $page->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Ошибка обновления лендинга'], 500);
        }
    }

    /**
     * DELETE /api/landing/pages/{id}
     * Удалить лендинг (требует авторизации)
     */
    public function destroy(LandingPage $page): JsonResponse
    {
        try {
            $page->delete(); // Soft delete

            return response()->json(null, 204);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@destroy] Ошибка', [
                'page_id' => $page->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Ошибка удаления лендинга'], 500);
        }
    }

    /**
     * POST /api/landing/pages/{id}/publish
     * Опубликовать/снять публикацию (требует авторизации)
     */
    public function publish(LandingPage $page): JsonResponse
    {
        try {
            if ($page->is_published) {
                $page->update([
                    'is_published' => false,
                    'published_at' => null,
                ]);
                $message = 'Публикация снята';
            } else {
                $page->update([
                    'is_published' => true,
                    'published_at' => now(),
                ]);
                $message = 'Лендинг опубликован';
            }

            return response()->json([
                'message' => $message,
                'is_published' => $page->fresh()->is_published,
                'published_at' => $page->fresh()->published_at?->toIso8601String(),
            ]);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@publish] Ошибка', [
                'page_id' => $page->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Ошибка публикации'], 500);
        }
    }

    /**
     * GET /api/landing/public/{slug}
     * Публичный доступ к лендингу (БЕЗ авторизации)
     */
    public function publicShow(string $slug): JsonResponse
    {
        try {
            $page = LandingPage::published()
                ->where('slug', $slug)
                ->first();

            if (!$page) {
                return response()->json(['error' => 'Лендинг не найден'], 404);
            }

            return response()->json([
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'type' => $page->type,
                'description' => $page->description,
                'is_published' => $page->is_published,
                'published_at' => $page->published_at?->toIso8601String(),
                'settings' => $page->settings,
                'blocks' => $this->getEnabledSortedBlocks($page->blocks),
                'created_at' => $page->created_at?->toIso8601String(),
                'updated_at' => $page->updated_at?->toIso8601String(),
            ]);

        } catch (\Throwable $e) {
            Log::error('[LandingPageController@publicShow] Ошибка', [
                'slug' => $slug,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Ошибка загрузки лендинга'], 500);
        }
    }

    /**
     * Вспомогательный метод: получить включённые и отсортированные блоки
     */
    private function getEnabledSortedBlocks(?array $blocks): array
    {
        if (empty($blocks)) {
            return [];
        }

        // Фильтруем только включённые блоки
        $enabled = array_filter($blocks, fn($block) => ($block['enabled'] ?? true) === true);

        // Сортируем по order
        usort($enabled, fn($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));

        return array_values($enabled);
    }
}
