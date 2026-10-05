<?php

namespace App\Http\Controllers\TalkStream;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ConfigController extends Controller
{
    /**
     * Получить конфигурацию модуля TalkStream для фронтенда
     *
     * @return JsonResponse
     */
    public function getConfig(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'ui' => [
                    'enable_read_receipts' => (bool) config('talkstream.ui.enable_read_receipts', true),
                    'messages_per_page'    => (int) config('talkstream.ui.messages_per_page', 50),
                ],
                'limits' => [
                    'max_message_length' => (int) config('talkstream.limits.max_message_length', 5000),
                ],
            ]
        ]);
    }
}
