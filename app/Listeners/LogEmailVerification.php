<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Verified;
use App\Models\Log as LogModel;
use Illuminate\Support\Facades\Log;

class LogEmailVerification
{
    /**
     * Handle the event.
     */
    public function handle(Verified $event): void
    {
        $user = $event->user;

        // Проверяем, было ли поле заполнено ДО текущего сохранения (это перепроверка)
        $isReverification = $user->getOriginal('email_verified_at') !== null;

        if ($isReverification) {
            $user->email_reverified_at = now();
            $user->save();

            // 🔥 Используем переводы Laravel
            $title = __('auth.log_email_reverified_title');
            $content = __('auth.log_email_reverified_content', ['email' => $user->email]);
        } else {
            $title = __('auth.log_email_verified_title');
            $content = __('auth.log_email_verified_content', ['email' => $user->email]);
        }

        // Пишем в журнал аудита
        try {
            LogModel::create([
                'user_id' => $user->id,
                'operator_id' => $user->id,
                'title' => $title,
                'content' => $content,
            ]);
        } catch (\Throwable $e) {
            Log::warning('[LogEmailVerification] Audit log failed', ['error' => $e->getMessage()]);
        }
    }
}
