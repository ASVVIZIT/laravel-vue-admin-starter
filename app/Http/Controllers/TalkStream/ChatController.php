<?php
namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\MessageRead;
use App\Events\TalkStream\NewMessage;
use App\Http\Requests\TalkStream\SendMessageRequest;
use App\Http\Controllers\Controller;
use App\Models\TalkStream\FriendRequest;
use App\Models\TalkStream\Message;
use App\Services\TalkStream\MessageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    public function __construct(
        protected MessageService $messageService
    ) {}
    public function sendMessage(SendMessageRequest $request)
    {
        try {
            $message = $this->messageService->create(
                auth()->id(),
                $request->validated('to_id'),
                $request->validated('content')
            );

            return responseSuccess($message, 'Message sent');

        } catch (\Exception $e) {
            return responseFailed($e->getMessage(), 403);
        }
    }

    public function getHistory(Request $request, $userId)
    {
        $messages = Message::where(function ($q) use ($request, $userId) {
            $q->where('from_id', $request->user()->id)->where('to_id', $userId);
        })
            ->orWhere(function ($q) use ($request, $userId) {
                $q->where('from_id', $userId)->where('to_id', $request->user()->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['data' => $messages]);
    }

    public function markAsRead($userReadId)
    {
        $userId = auth()->id();
        Message::where('to_id', $userId)
            ->where('from_id', $userReadId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        event(new MessageRead([
            'from_id' => $userReadId,
            'to_id' => $userId
        ]));

        return response()->json(['status' => 'ok']);
    }
}
