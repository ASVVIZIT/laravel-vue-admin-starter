<?php

namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\FriendRequestSent;
use App\Http\Controllers\Controller;
use App\Models\TalkStream\FriendRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendRequestController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate(['friend_id' => 'required|exists:users,id|not_in:' . Auth::id()]);
        $existing = FriendRequest::where(['user_id' => Auth::id(), 'friend_id' => $data['friend_id']])->first();

        if ($existing && !$existing->accepted && !$existing->declined) {
            return response()->json(['message' => 'Запрос уже отправлен'], 409);
        }

        $req = FriendRequest::create(['user_id' => Auth::id(), 'friend_id' => $data['friend_id']]);
        event(new FriendRequestSent([
            'user_id' => Auth::id(),
            'friend_id' => $data['friend_id']
        ]));

        return response()->json(['message' => 'Запрос отправлен', 'data' => $req], 201);
    }

    public function accept(Request $request, $id)
    {
        $req = FriendRequest::findOrFail($id);

        if ($req->friend_id !== Auth::id()) {
            return response()->json(['message' => 'Нельзя принять чужой запрос'], 403);
        }

        $req->update(['accepted' => true]);
        return response()->json(['message' => 'Запрос принят', 'data' => $req]);
    }

    public function incoming()
    {
        return response()->json(FriendRequest::where('friend_id', Auth::id())
                ->where('accepted', false)
            .where('declined', false)
            .with('user')
            .get());
    }

    public function friends()
    {
        return response()->json(FriendRequest::where('user_id', Auth::id())->where('accepted', true)->with('friend')->get());
    }
}
