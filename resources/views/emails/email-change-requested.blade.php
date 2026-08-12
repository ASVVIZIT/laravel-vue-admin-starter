<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Подтверждение смены email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4F46E5;">Подтверждение смены email</h2>

    <p>Здравствуйте, {{ $user->name }}!</p>

    <p>Кто-то запросил смену email адреса для вашего аккаунта:</p>

    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Текущий email:</strong> {{ $user->email }}</p>
        <p><strong>Новый email:</strong> {{ $newEmail }}</p>
    </div>

    <p>Если это были вы, пожалуйста, подтвердите смену, нажав на кнопку ниже:</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $confirmationUrl }}"
           style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Подтвердить смену email
        </a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
        Если вы не запрашивали смену email, просто проигнорируйте это письмо. Ваш email останется неизменным.
    </p>

    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Это автоматическое письмо, пожалуйста, не отвечайте на него.
    </p>
</div>
</body>
</html>
