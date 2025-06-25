<?php
namespace App\Http\Controllers\TalkStream;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ContactController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Пользователь не авторизован'], 401);
        }

        $contacts = User::where('id', '!=', $user->id)
            ->with(['roles:id,name']) // Подгружаем роли
            ->get();

        return response()->json(['data' => $contacts]);
    }

    // Получить одного пользователя
    public function show($id)
    {
        $contact = User::with(['roles'])->findOrFail($id);
        return response()->json(['data' => $contact]);
    }

}
