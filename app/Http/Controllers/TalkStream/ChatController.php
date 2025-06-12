<?php
namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\NewMessage;
use App\Http\Controllers\Controller;
use App\Models\TalkStream\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'to_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = Message::create([
            'from_id' => Auth::id(),
            'to_id' => $request->input('to_id'),
            'content' => $request->input('content'),
        ]);

        event(new NewMessage([
            'id' => $message->id,
            'from_id' => $message->from_id,
            'to_id' => $message->to_id,
            'content' => $message->content,
            'created_at' => $message->created_at,
        ]));

        return response()->json(['status' => 'Message sent']);
    }

    public function getHistory(Request $request, $userId)
    {
        $messages = Message::where(function ($q) use ($request, $userId) {
            $q->where('from_id', $request->user()->id)->where('to_id', $userId);
        })->orWhere(function ($q) use ($request, $userId) {
            $q->where('from_id', $userId)->where('to_id', $request->user()->id);
        })->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }
}
