<?php

namespace App\Services\TalkStream;

use App\Events\TalkStream\NewMessage;
use App\Models\TalkStream\Message;
use App\Services\TalkStream\FriendService;
use Illuminate\Support\Facades\Auth;

class MessageService
{
    /**
     * Создает сообщение и отправляет событие
     *
     * @param int $fromId
     * @param int $toId
     * @param string $content
     * @return Message
     */
    public function create(int $fromId, int $toId, string $content): Message
    {
        // 1. Проверка дружбы через FriendService
        // (Нужно убедиться, что сервис подключен через use App\Services\TalkStream\FriendService;)
        if (!FriendService::areFriends($fromId, $toId)) {
            throw new \Exception('Вы можете писать только друзьям');
        }

        // 2. Создание записи
        $message = Message::create([
            'from_id' => $fromId,
            'to_id'   => $toId,
            'content' => $content,
            'type'    => 'text', // Дефолт
        ]);

        // 3. Broadcast
        broadcast(new NewMessage([
            'id'         => $message->id,
            'from_id'    => $message->from_id,
            'to_id'      => $message->to_id,
            'content'    => $message->content,
            'type'       => $message->type,
            'created_at' => $message->created_at->toISOString(),
        ]))->toOthers();

        return $message;
    }
}
