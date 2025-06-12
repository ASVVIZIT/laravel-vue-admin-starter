<?php

namespace App\Events\TalkStream;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;

class FriendRequestAccepted implements ShouldBroadcast
{
    use Dispatchable;

    public function __construct(public array $request) {}

    public function broadcastOn(): Channel
    {
        return new Channel('friends.' . $this->request['user_id']);
    }

    public function broadcastAs(): string
    {
        return 'FriendRequestAccepted';
    }
}
