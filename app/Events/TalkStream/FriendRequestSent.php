<?php

namespace App\Events\TalkStream;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class FriendRequestSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public array $request) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('friends.' . $this->request['friend_id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FriendRequestSent';
    }

    public function broadcastWith(): array
    {
        return ['request' => $this->request];
    }
}
