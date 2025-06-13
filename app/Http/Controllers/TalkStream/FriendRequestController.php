<?php

namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\FriendRequestSent;
use App\Events\TalkStream\FriendRequestAccepted;
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

        $existing = FriendRequestModel::where([
            ['user_id', Auth::id()],
            ['friend_id', $data['friend_id']]
        ])->first();

        if ($existing && !$existing->accepted && !$existing->declined) {
            return response()->json(['message' => 'Запрос уже отправлен'], 409);
        }

        $req = FriendRequestModel::create([
            'user_id' => Auth::id(),
            'friend_id' => $data['friend_id']
        ]);

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

        event(new FriendRequestAccepted([
            'user_id' => $req->user_id,
            'friend_id' => $req->friend_id
        ]));

        return response()->json(['message' => 'Запрос принят', 'data' => $req]);
    }

    // Входящие запросы
    public function incoming()
    {
        $requests = FriendRequestModel::where('friend_id', Auth::id())
            ->where(function ($query) {
                // Либо не принято и не отклонено (ожидает), либо уже друг
                $query->where(function ($q) {
                    $q->whereNull('accepted')->whereNull('declined');
                })->orWhere('accepted', true);
            })
            ->with('user:id,name,email')
            ->get();

        return response()->json(['data' => $requests]);
    }

    // Список друзей
    public function friends()
    {
        $userId = Auth::id();

        $friends = User::where('id', '!=', $userId)
            ->where(function ($query) use ($userId) {
                $query->whereHas('friendRequestsSent', function ($q) use ($userId) {
                    $q->where('friend_id', $userId)->where('accepted', true);
                })
                    ->orWhereHas('friendRequestsReceived', function ($q) use ($userId) {
                        $q->where('user_id', $userId)->where('accepted', true);
                    });
            })
            ->get();

        return response()->json(['data' => $friends]);
    }
    // для получения исходящих запросов
    public function sent()
    {
        $userId = Auth::id();

        $requests = FriendRequestModel::where('user_id', $userId)
            ->whereNull('accepted')
            ->whereNull('declined')
            ->with(['friend' => function ($q) {
                $q->select('id', 'name', 'email');
            }])
            ->get()
            ->filter(function ($request) {
                // Проверяем, что friend загружен
                return !is_null($request->friend);
            });

        return response()->json(['data' => $requests]);
    }

    public function isFriend(int $userId)
    {
        return response()->json([
            'isFriend' => self::areFriends(Auth::id(), $userId)
        ]);
    }
}
