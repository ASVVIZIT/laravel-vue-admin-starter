<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Подтверждение нового email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #10B981;">Подтверждение нового email</h2>

    <p>Здравствуйте!</p>

    <p>Ваш email был изменён на: <strong>{{ $newEmail }}</strong></p>

    <p>Для завершения процесса, пожалуйста, подтвердите новый email, нажав на кнопку ниже:</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $confirmationUrl }}"
           style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Подтвердить новый email
        </a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
        Если вы не запрашивали смену email, срочно обратитесь в службу поддержки.
    </p>

    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Это автоматическое письмо, пожалуйста, не отвечайте на него.
    </p>
</div>
</body>
</html>
