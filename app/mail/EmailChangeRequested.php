<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailChangeRequested extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $newEmail;
    public string $confirmationUrl;

    public function __construct(User $user, string $newEmail, string $confirmationUrl)
    {
        $this->user = $user;
        $this->newEmail = $newEmail;
        $this->confirmationUrl = $confirmationUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Подтверждение смены email',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.email-change-requested',
        );
    }
}
