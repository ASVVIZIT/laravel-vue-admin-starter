<?php

namespace App\Events\TalkStream;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->message['to_id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewMessage';
    }

    public function broadcastWith(): array
    {
        return ['message' => $this->message];
    }
}
