<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TalkStreamMessageEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $userId,
        public string $message
    ) {}

    public function broadcastOn()
    {
        return new PrivateChannel('talkstream.'.$this->userId);
    }

    public function broadcastAs()
    {
        return 'message.received';
    }

    public function broadcastWith()
    {
        return [
            'message' => [
                'id' => time(),
                'content' => $this->message,
                'sender_id' => 0, // Системное сообщение
                'created_at' => now()->toDateTimeString()
            ]
        ];
    }
}
