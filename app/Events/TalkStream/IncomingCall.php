<?php

namespace App\Events\TalkStream;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;

class IncomingCall implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $call) {}

    public function broadcastOn(): Channel
    {
        return new Channel('call.' . $this->call['callee_id']);
    }

    public function broadcastAs(): string
    {
        return 'IncomingCall';
    }
}
