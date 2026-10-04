<?php

namespace App\Http\Controllers\TalkStream;

use App\Events\TalkStream\MessageRead;
use App\Http\Controllers\Controller;
use App\Http\Requests\TalkStream\SendMessageRequest;
use App\Http\Resources\TalkStream\MessageResource;
use App\Models\TalkStream\Message;
use App\Services\TalkStream\MessageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function __construct(
        protected MessageService $messageService
    ) {}

    /**
     * Отправка сообщения
     * Валидация: SendMessageRequest
     * Логика: MessageService
     * Ответ: MessageResource
     */
    public function sendMessage(SendMessageRequest $request)
    {
        try {
            $message = $this->messageService->create(
                Auth::id(),
                $request->validated('to_id'),
                $request->validated('content')
            );

            return responseSuccess(new MessageResource($message), 'Message sent');
        } catch (\Exception $e) {
            return responseFailed($e->getMessage(), 403);
        }
    }

    /**
     * Получение истории переписки
     * Ответ: Коллекция MessageResource
     */
    public function getHistory(Request $request, int $userId)
    {
        $currentUserId = Auth::id();

        $messages = Message::where(function ($q) use ($currentUserId, $userId) {
            $q->where('from_id', $currentUserId)->where('to_id', $userId);
        })
            ->orWhere(function ($q) use ($currentUserId, $userId) {
                $q->where('from_id', $userId)->where('to_id', $currentUserId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return responseSuccess(MessageResource::collection($messages));
    }

    /**
     * Отметка сообщений как прочитанных
     * Broadcast: config-based event name
     * Ответ: responseSuccess
     */
    public function markAsRead(Request $request, int $userReadId)
    {
        $currentUserId = Auth::id();

        // Обновляем только непрочитанные
        $updated = Message::where('to_id', $currentUserId)
            ->where('from_id', $userReadId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Отправляем событие только если были реальные обновления
        if ($updated > 0) {
            broadcast(new MessageRead([
                'from_id' => $userReadId,
                'to_id'   => $currentUserId,
                'updated_count' => $updated
            ]))->toOthers();
        }

        return responseSuccess(['read_at' => now()->toISOString()], 'Messages marked as read');
    }
}
