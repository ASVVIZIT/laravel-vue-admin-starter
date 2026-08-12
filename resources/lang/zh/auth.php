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

    'failed' => '这些凭证与我们的记录不符。',
    'password' => '提供的密码不正确。',
    'throttle' => '登录尝试次数过多。请在 :seconds 秒后重试。',

    /*
    |--------------------------------------------------------------------------
    | Email Verification Language Lines
    |--------------------------------------------------------------------------
    */

    'verified' => '您的电子邮件地址已成功验证！',
    'verification_sent' => '新的验证链接已发送至您的电子邮件地址。',

    // 🔥 Сообщения для перепроверки (Re-verification)
    'reverification_sent' => '重新验证电子邮件地址的链接已发送至您的收件箱。',
    'email_already_verified' => '您的电子邮件地址已验证。',

    /*
    |--------------------------------------------------------------------------
    | Audit Log Titles & Content (Для LogEmailVerification.php)
    |--------------------------------------------------------------------------
    */
    'log_email_verified_title' => '电子邮件已验证',
    'log_email_verified_content' => '用户首次验证了他们的电子邮件地址：:email',

    'log_email_reverified_title' => '电子邮件已重新验证',
    'log_email_reverified_content' => '用户确认了其电子邮件地址的有效性：:email',

];
