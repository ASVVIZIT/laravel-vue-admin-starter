<?php

namespace App\Events\TalkStream;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class IncomingCall implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $call) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('call.' . $this->call['callee_id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'IncomingCall';
    }

    public function broadcastWith(): array
    {
        return ['call' => $this->call];
    }
}
