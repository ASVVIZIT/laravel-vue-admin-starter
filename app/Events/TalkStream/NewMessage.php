<?php

namespace App\Events\TalkStream;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable;

    public function __construct(public array $message) {}

    public function broadcastOn(): Channel
    {
        return new Channel('chat.' . $this->message['to_id']);
    }

    public function broadcastAs(): string
    {
        return 'NewMessage';
    }
}
