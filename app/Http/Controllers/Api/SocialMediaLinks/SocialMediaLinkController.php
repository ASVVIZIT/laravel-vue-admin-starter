<?php

namespace App\Http\Controllers\Api\SocialMediaLinks;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaLink\SocialMediaLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator; // Импортируем Validator

class SocialMediaLinkController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:manage_social_media_links')->except('index');
    }

    public function index()
    {
        return SocialMediaLink::orderBy('order_column')->get();
    }

    public function store(Request $request)
    {
        // Основная валидация - проверяем, что URL не пустый и не слишком длинный
        // Поле description теперь может быть строкой или отсутствовать (null)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:300',
            'url' => 'required|string|max:1000', // Увеличиваем максимальную длину
            'icon' => 'required|string|max:100',
            'order_column' => 'nullable|integer|min:0',
            'description' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Validation failed', 'messages' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        // Нормализуем URL
        $url = trim($validated['url']);
        if (empty($url)) {
            return response()->json(['error' => 'URL cannot be empty'], 422);
        }

        // Проверяем и добавляем протокол, если его нет
        if (!preg_match('/^https?:\/\//i', $url)) {
            $url = 'https://' . $url;
        }

        // Более мягкая проверка URL
        // Проверяем базовую структуру: протокол, домен
        // Не проверяем строго путь и параметры
        if (!preg_match('/^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i', $url)) {
            return response()->json(['error' => 'Invalid URL format'], 422);
        }

        $validated['url'] = $url;

        // Проверяем, был ли передан description в запросе
        if (!array_key_exists('description', $validated) || is_null($validated['description']) || trim($validated['description']) === '') {
            // Если поле отсутствует, null или пустая строка после trim, устанавливаем его в null (или в пустую строку '', если в БД default '')
            $validated['description'] = null; // Или '' если поле в БД NOT NULL с default ''
        }

        if (!isset($validated['order_column'])) {
            $maxOrder = SocialMediaLink::max('order_column') ?? -1;
            $validated['order_column'] = $maxOrder + 1;
        }

        $link = SocialMediaLink::create($validated);
        return response()->json($link, 201);
    }

    public function update(Request $request, $id)
    {
        $link = SocialMediaLink::findOrFail($id);

        // Основная валидация
        // description может быть строкой, пустой строкой или отсутствовать
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:300',
            'url' => 'required|string|max:1000', // Увеличиваем максимальную длину
            'icon' => 'required|string|max:100',
            'order_column' => 'nullable|integer|min:0',
            'description' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Validation failed', 'messages' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        // Нормализуем URL
        $url = trim($validated['url']);
        if (empty($url)) {
            return response()->json(['error' => 'URL cannot be empty'], 422);
        }

        // Проверяем и добавляем протокол, если его нет
        if (!preg_match('/^https?:\/\//i', $url)) {
            $url = 'https://' . $url;
        }

        // Более мягкая проверка URL
        if (!preg_match('/^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i', $url)) {
            return response()->json(['error' => 'Invalid URL format'], 422);
        }

        $validated['url'] = $url;

        // Проверяем, был ли передан description в запросе
        if (!array_key_exists('description', $validated) || is_null($validated['description']) || trim($validated['description']) === '') {
            // Если поле отсутствует, null или пустая строка после trim, устанавливаем его в null (или в пустую строку '', если в БД default '')
            $validated['description'] = null; // Или '' если поле в БД NOT NULL с default ''
        }

        $link->update($validated);
        return response()->json($link);
    }

    public function destroy($id)
    {
        $link = SocialMediaLink::findOrFail($id);
        $link->delete();
        return response()->json(['success' => true]);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:social_media_links,id'
        ]);

        $order = $request->input('order');

        DB::beginTransaction();
        try {
            foreach ($order as $index => $id) {
                SocialMediaLink::where('id', $id)->update(['order_column' => $index]);
            }
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Order updated successfully']);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
