<?php

namespace App\Events\TalkStream;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class MessageRead implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.read.' . $this->message['from_id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageRead';
    }

    public function broadcastWith(): array
    {
        return ['message' => $this->message];
    }
}
