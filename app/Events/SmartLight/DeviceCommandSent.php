<?php

namespace App\Events\SmartLight;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeviceCommandSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $deviceId;
    public $command;
    public $timestamp;

    public function __construct($deviceId, $command)
    {
        $this->deviceId = $deviceId;
        $this->command = $command;
        $this->timestamp = now()->toIso8601String();
    }

    public function broadcastOn()
    {
        return new PrivateChannel('smart-light.device.' . $this->deviceId);
    }

    public function broadcastWith()
    {
        return [
            'command' => $this->command,
            'timestamp' => $this->timestamp,
            'device_id' => $this->deviceId
        ];
    }
}
