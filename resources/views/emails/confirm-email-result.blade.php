<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }

        .icon.success {
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            color: white;
        }

        .icon.error {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
        }

        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 16px;
            line-height: 1.3;
        }

        p {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 24px;
        }

        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .button:active {
            transform: translateY(0);
        }

        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 32px 0;
        }

        .footer-text {
            font-size: 14px;
            color: #718096;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="icon {{ $status }}">
        @if($status === 'success')
            ✓
        @else
            ✗
        @endif
    </div>

    <h1>{{ $title }}</h1>

    <p>{{ $message }}</p>

    @if($status === 'success')
        <a href="{{ config('app.url') }}/login" class="button">
            Перейти ко входу
        </a>
    @else
        <a href="{{ config('app.url') }}" class="button">
            Вернуться на главную
        </a>
    @endif

    <div class="divider"></div>

    <p class="footer-text">
        Если у вас возникли вопросы, свяжитесь с нами:<br>
        <a href="mailto:DillerASV@yandex.ru" style="color: #667eea;">DillerASV@yandex.ru</a>
    </p>
</div>
</body>
</html>
