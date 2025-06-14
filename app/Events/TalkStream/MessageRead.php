<?php

namespace App\Events\TalkStream;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;

class MessageRead implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $message) {}

    public function broadcastOn(): Channel
    {
        return new Channel('chat.read.' . $this->message['from_id']);
    }

    public function broadcastAs(): string
    {
        return 'MessageRead';
    }
}
