<?php

namespace App\Events\TalkStream;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class FriendRequestAccepted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $request) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('friends.' . $this->request['user_id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FriendRequestAccepted';
    }

    public function broadcastWith(): array
    {
        return ['request' => $this->request];
    }
}
