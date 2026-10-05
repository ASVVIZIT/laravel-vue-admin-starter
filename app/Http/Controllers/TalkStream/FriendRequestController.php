<?php

namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\FriendRequestSent;
use App\Events\TalkStream\FriendRequestAccepted;
use App\Events\TalkStream\FriendRequestDeclined;
use App\Http\Controllers\Controller;
use App\Models\TalkStream\FriendRequest;
use App\Models\User;
use Illuminate\Http\Request;

class FriendRequestController extends Controller
{
    public function send(Request $request)
    {
        $userId = auth()->id();
        $data = $request->validate([
            'friend_id' => 'required|exists:users,id|not_in:' . $userId
        ]);

        // 🔥 ПРОВЕРКА: Запрос уже существует в ЛЮБОМ направлении?
        $existing = FriendRequest::where(function ($q) use ($userId, $data) {
            $q->where('user_id', $userId)->where('friend_id', $data['friend_id']);
        })->orWhere(function ($q) use ($userId, $data) {
            $q->where('user_id', $data['friend_id'])->where('friend_id', $userId);
        })->whereNull('accepted')->whereNull('declined')->first();

        if ($existing) {
            return response()->json([
                'message' => 'Запрос уже существует (проверьте входящие)',
                'is_mutual' => $existing->user_id !== $userId
            ], 409);
        }

        $req = FriendRequest::create([
            'user_id' => $userId,
            'friend_id' => $data['friend_id']
        ]);

        broadcast(new FriendRequestSent([
            'id' => $req->id,
            'user_id' => $userId,
            'friend_id' => $data['friend_id']
        ]))->toOthers();

        return response()->json(['message' => 'Запрос отправлен', 'data' => $req], 201);
    }

    public function accept(Request $request, $id)
    {
        $req = FriendRequest::findOrFail($id);
        $userId = auth()->id();

        if ($req->friend_id !== $userId) {
            return response()->json(['message' => 'Нельзя принять чужой запрос'], 403);
        }

        $req->update(['accepted' => true, 'declined' => null]);

        broadcast(new FriendRequestAccepted([
            'user_id' => $req->user_id,
            'friend_id' => $userId
        ]))->toOthers();

        return response()->json(['message' => 'Запрос принят', 'data' => $req]);
    }

    public function decline(Request $request, $id)
    {
        $req = FriendRequest::findOrFail($id);
        $userId = auth()->id();

        if ($req->friend_id !== $userId) {
            return response()->json(['message' => 'Нельзя отклонить чужой запрос'], 403);
        }

        $req->update(['declined' => true, 'accepted' => null]);

        broadcast(new FriendRequestDeclined([
            'user_id' => $req->user_id,
            'friend_id' => $userId
        ]))->toOthers();

        return response()->json(['message' => 'Запрос отклонен']);
    }

    public function incoming()
    {
        $userId = auth()->id();
        $requests = FriendRequest::where('friend_id', $userId)
            ->whereNull('accepted')->whereNull('declined')
            ->with(['user:id,name,avatar'])
            ->get();
        return response()->json(['data' => $requests]);
        // Возвращает: [{ id: 1, user_id: 5, friend_id: 1, user: { id: 5, name: '...' } }]
    }

    public function sent()
    {
        $userId = auth()->id();
        $requests = FriendRequest::where('user_id', $userId)
            ->whereNull('accepted')->whereNull('declined')
            ->with(['friend:id,name,avatar'])
            ->get();
        return response()->json(['data' => $requests]);
        // Возвращает: [{ id: 2, user_id: 1, friend_id: 5, friend: { id: 5, name: '...' } }]
    }

    public function friends()
    {
        $userId = auth()->id();
        $friends = User::where('id', '!=', $userId)
            ->where(function ($query) use ($userId) {
                $query->whereHas('friendRequestsSent', fn($q) => $q->where('friend_id', $userId)->where('accepted', true))
                    ->orWhereHas('friendRequestsReceived', fn($q) => $q->where('user_id', $userId)->where('accepted', true));
            })->get(['id', 'name', 'avatar']);

        return response()->json(['data' => $friends]);
    }
}
