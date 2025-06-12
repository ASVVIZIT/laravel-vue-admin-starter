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

        // Получаем всех пользователей кроме текущего, то есть самого себя
        $contacts = User::where('id', '!=', $user->id)->get();

        return response()->json($contacts);
    }
}
