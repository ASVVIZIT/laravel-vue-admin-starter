<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
    */

    'failed' => 'These credentials do not match our records.',
    'password' => 'The provided password is incorrect.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',

    /*
    |--------------------------------------------------------------------------
    | Email Verification Language Lines
    |--------------------------------------------------------------------------
    */

    'verified' => 'Your email address has been successfully verified!',
    'verification_sent' => 'A new verification link has been sent to your email address.',

    // 🔥 Messages for Re-verification
    'reverification_sent' => 'A link to re-verify your email address has been sent to your inbox.',
    'email_already_verified' => 'Your email address is already verified.',

    /*
    |--------------------------------------------------------------------------
    | Audit Log Titles & Content (For LogEmailVerification.php)
    |--------------------------------------------------------------------------
    */
    'log_email_verified_title' => 'Email Verified',
    'log_email_verified_content' => 'User verified their email address for the first time: :email',

    'log_email_reverified_title' => 'Email Re-verified',
    'log_email_reverified_content' => 'User confirmed the relevance of their email address: :email',

];
