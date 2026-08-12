<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Письмо для восстановления удалённой (SoftDeleted) учётки
 */
class RestoreAccountNotification extends Notification
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $hash = sha1($notifiable->getEmailForVerification());
        $url = request()->getSchemeAndHttpHost()
            . '/api/auth/restore/' . $notifiable->getKey() . '/' . $hash;

        return (new MailMessage)
            ->subject('Восстановление учётки — Fenix Portal')
            ->line('Ваша учётка была удалена. Вы запросили её восстановление.')
            ->line('Нажмите кнопку ниже, чтобы восстановить аккаунт и установить новый пароль.')
            ->action('Восстановить учётку', $url)
            ->line('Если это были не вы — просто проигнорируйте это письмо.');
    }
}
