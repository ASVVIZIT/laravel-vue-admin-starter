<?php

namespace App\Http\Controllers\Api\GlobalChat;

use App\Events\NewMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use function event;
use function response;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        return Message::with('sender')
            ->where(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        // Загружаем отправителя для ответа
        $message->load('sender');

        event(new NewMessageEvent($message));

        return response()->json($message, 201);
    }
}
