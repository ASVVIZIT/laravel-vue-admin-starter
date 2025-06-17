<?php

namespace App\Events\TalkStream;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $message) {}

    public function broadcastOn(): Channel
    {
        return new Channel('chat.' . $this->message['to_id']);
    }

    public function broadcastAs(): string
    {
        return 'NewMessage';
    }
    public function broadcastWith()
    {
        return ['message' => $this->message];
    }
}
