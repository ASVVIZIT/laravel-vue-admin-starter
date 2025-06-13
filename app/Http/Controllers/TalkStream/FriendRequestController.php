<?php

namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\FriendRequestSent;
use App\Http\Controllers\Controller;
use App\Models\TalkStream\FriendRequest as FriendRequestModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendRequestController extends Controller
{
    // Отправка запроса в друзья
    public function send(Request $request)
    {
        $data = $request->validate(['friend_id' => 'required|exists:users,id|not_in:' . Auth::id()]);
        $existing = FriendRequestModel::where(['user_id' => Auth::id(), 'friend_id' => $data['friend_id']])->first();

        if ($existing && !$existing->accepted && !$existing->declined) {
            return response()->json(['message' => 'Запрос уже отправлен'], 409);
        }

        $req = FriendRequestModel::create(['user_id' => Auth::id(), 'friend_id' => $data['friend_id']]);
        event(new FriendRequestSent([
            'user_id' => Auth::id(),
            'friend_id' => $data['friend_id']
        ]));

        return response()->json(['message' => 'Запрос отправлен', 'data' => $req], 201);
    }

    // Принятие запроса
    public function accept(Request $request, $id)
    {
        $req = FriendRequestModel::findOrFail($id);

        if ($req->friend_id !== Auth::id()) {
            return response()->json(['message' => 'Нельзя принять чужой запрос'], 403);
        }

        $req->update(['accepted' => true]);
        return response()->json(['message' => 'Запрос принят', 'data' => $req]);
    }

    // Входящие запросы
    public function incoming()
    {
        $requests = FriendRequestModel::where('friend_id', Auth::id())
            ->where('accepted', false)
            ->where('declined', false)
            ->with('user')
            ->get();

        return response()->json(['data' => $requests]);
    }

    // Список друзей
    public function friends()
    {
        $userId = Auth::id();

        $users = User::where('id', '!=', $userId)->get();

        $friends = $users->filter(fn($user) => FriendRequestModel::areFriends($userId, $user->id));

        return response()->json(['data' => $friends]);
    }
}
