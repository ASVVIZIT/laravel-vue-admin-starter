<?php

namespace App\Http\Controllers\Api\SocialMediaLinks;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaLink\SocialMediaLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Добавляем импорт

class SocialMediaLinkController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:manage_social_media_links')->except('index');
    }

    public function index()
    {
        return SocialMediaLink::orderBy('order')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'url' => 'required|url',
            'icon' => 'required|string',
            'order' => 'nullable|integer|min:0'
        ]);

        // Нормализуем URL - убираем лишние пробелы и добавляем протокол при необходимости
        $url = trim($validated['url']);

        // Проверяем, есть ли протокол
        if (!preg_match('/^https?:\/\//', $url)) {
            $url = 'https://' . $url;
        }

        $validated['url'] = $url;

        // Если порядок не указан, устанавливаем его как максимальный + 1
        if (!isset($validated['order']) || $validated['order'] === null) {
            $maxOrder = SocialMediaLink::max('order') ?? -1;
            $validated['order'] = $maxOrder + 1;
        }

        $link = SocialMediaLink::create($validated);
        return response()->json($link, 201);
    }

    public function update(Request $request, SocialMediaLink $link)
    {

        // Проверяем, что запись существует
        if (!$link) {
            return response()->json(['error' => 'Ссылка не найдена'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'url' => 'required|url',
            'icon' => 'required|string',
            'order' => 'nullable|integer|min:0'
        ]);

        // Нормализуем URL - убираем лишние пробелы и добавляем протокол при необходимости
        $url = trim($validated['url']);

        // Проверяем, есть ли протокол
        if (!preg_match('/^https?:\/\//', $url)) {
            $url = 'https://' . $url;
        }

        $validated['url'] = $url;

        $link->update($validated);

        $link->update($validated);
        return response()->json($link);
    }

    public function destroy(SocialMediaLink $link)
    {
        // Убедимся, что запись существует перед удалением
        if (!$link) {
            return response()->json(['error' => 'Ссылка не найдена'], 404);
        }

        // Удаляем запись
        $link->delete();

        return response()->noContent();
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:social_media_links,id'
        ]);

        $order = $request->input('order');

        // Начинаем транзакцию для обеспечения целостности данных
        DB::beginTransaction();

        try {
            // Обновляем порядок для всех элементов
            foreach ($order as $index => $id) {
                SocialMediaLink::where('id', $id)->update(['order' => $index]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Порядок успешно обновлен',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Ошибка обновления порядка',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
