<?php

namespace App\Services\TalkStream;

use App\Events\TalkStream\NewMessage;
use App\Models\TalkStream\Message;
use App\Services\TalkStream\FriendService;

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
        if (!FriendService::areFriends($fromId, $toId)) {
            throw new \Exception('Вы можете писать только друзьям');
        }

        // 2. Создание записи
        $message = Message::create([
            'from_id' => $fromId,
            'to_id'   => $toId,
            'content' => $content,
            'type'    => 'text',
        ]);

        // 3. Broadcast
        // Добавлены read_at и formatted_created_at, чтобы фронтенд сразу получил время
        broadcast(new NewMessage([
            'id'                   => $message->id,
            'from_id'              => $message->from_id,
            'to_id'                => $message->to_id,
            'content'              => $message->content,
            'type'                 => $message->type,
            'read_at'              => $message->read_at ? $message->read_at->toISOString() : null,
            'created_at'           => $message->created_at->toISOString(),
            'formatted_created_at' => $message->formatted_created_at,
        ]))->toOthers();

        return $message;
    }
}
