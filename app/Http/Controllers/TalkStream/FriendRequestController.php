<?php

namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\FriendRequestSent;
use App\Events\TalkStream\FriendRequestAccepted;
use App\Http\Controllers\Controller;
use App\Models\TalkStream\FriendRequest;
use App\Models\User;
use Illuminate\Http\Request;

class FriendRequestController extends Controller
{
    // Отправка запроса в друзья
    public function send(Request $request)
    {
        $userId = auth()->id();
        $data = $request->validate(['friend_id' => 'required|exists:users,id|not_in:' . $userId]);
        $existing = FriendRequest::where([
            ['user_id', $userId],
            ['friend_id', $data['friend_id']]
        ])->first();

        if ($existing && !$existing->accepted && !$existing->declined) {
            return response()->json(['message' => 'Запрос уже отправлен'], 409);
        }

        $req = FriendRequest::create([
            'user_id' => $userId,
            'friend_id' => $data['friend_id']
        ]);

        broadcast(new FriendRequestSent([
            'user_id' => $userId,
            'friend_id' => $data['friend_id']
        ]))->toOthers();

        return response()->json(['message' => 'Запрос отправлен', 'data' => $req], 201);
    }

    // Принятие запроса
    public function accept(Request $request, $id)
    {
        $req = FriendRequest::findOrFail($id);
        $userId = auth()->id();

        if ($req->friend_id !== $userId) {
            return response()->json(['message' => 'Нельзя принять чужой запрос'], 403);
        }

        $req->update([
            'accepted' => true,
            'declined' => null,
        ]);

        broadcast(new FriendRequestAccepted([
            'user_id' => $req->user_id,
            'friend_id' => $userId
        ]));

        return response()->json(['message' => 'Запрос принят', 'data' => $req]);
    }

    // Входящие запросы
    public function incoming()
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $requests = FriendRequest::where('friend_id', $userId)
            ->whereNull('accepted')
            ->whereNull('declined')
            ->with([
                'user:id,name,avatar'
            ])
            ->get();

        return response()->json(['data' => $requests]);
    }

    // для получения исходящих запросов
    public function sent()
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $requests = FriendRequest::where('user_id', $userId)
            ->whereNull('accepted')
            ->whereNull('declined')
            ->with([
                'friend:name'
            ])
            ->get();

        return response()->json(['data' => $requests]);
    }

    public function isFriend(Request $request, int $userId)
    {
        $currentUserId = auth()->id();
        if (!$currentUserId) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'isFriend' => self::areFriends($currentUserId, $userId)
        ]);
    }
    // Список друзей
    public function friends()
    {
        $userId = auth()->id();

        $friends = User::where('id', '!=', $userId)
            ->where(function ($query) use ($userId) {
                $query->whereHas('friendRequestsSent', function ($q) use ($userId) {
                    $q->where('friend_id', $userId)->whereNotNull('accepted');
                })
                    ->orWhereHas('friendRequestsReceived', function ($q) use ($userId) {
                        $q->where('user_id', $userId)->whereNotNull('accepted');
                    });
            })
            ->get();

        return response()->json(['data' => $friends]);
    }
}
