<?php
namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\IncomingCall;
use App\Models\TalkStream\FriendRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;

class CallController extends Controller
{
    public function startCall(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'to_id' => 'required|exists:users,id',
            'type' => 'in:audio,video'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $to_id = $request->input('to_id');

        if (!FriendRequest::areFriends(Auth::id(), $to_id)) {
            return response()->json(['error' => 'Вы можете звонить только друзьям'], 403);
        }

        $callData = [
            'caller_id' => $request->user()->id,
            'callee_id' => $to_id,
            'type' => $request->input('type') ?? 'video',
            'timestamp' => now()->toISOString()
        ];

        event(new IncomingCall($callData));

        return response()->json(['status' => 'Звонок начат', 'data' => $callData]);
    }

    public function endCall()
    {
        return response()->json(['status' => 'Call ended']);
    }
}
