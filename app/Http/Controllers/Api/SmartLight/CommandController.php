<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CommandController extends Controller
{
    public function getCommand(Request $request, $device_id)
    {
        $device = $request->device;

        // Проверяем кеш команд
        $command = Cache::get("cmd_{$device_id}");
        $hasCommand = $command !== null;

        if ($hasCommand) {
            // Удаляем команду после получения
            Cache::forget("cmd_{$device_id}");
        }

        return response()->json([
            'command' => $hasCommand ? $command['command'] : null,
            'intensity' => $hasCommand && isset($command['intensity']) ? $command['intensity'] : 100,
            'device_id' => $device_id,
            'has_command' => $hasCommand
        ]);
    }
}
