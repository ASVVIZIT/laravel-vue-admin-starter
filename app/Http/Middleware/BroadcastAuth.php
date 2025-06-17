<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

class BroadcastAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()) {
            Log::warning('Broadcast auth failed - unauthenticated', [
                'channel' => $request->channel_name,
                'token' => $request->bearerToken()
            ]);
        } else {
            Log::info('Broadcast auth success', [
                'user_id' => $request->user()->id,
                'channel' => $request->channel_name
            ]);
        }

        return Broadcast::auth($request);
    }
}
