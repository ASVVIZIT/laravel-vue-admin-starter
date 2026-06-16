<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Laravel') }}</title>
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">
    <meta name="theme-color" content="#ffffff">
    {{-- Подключаем app.js через наш хелпер --}}
    {{ vite_admin_assets() }}
    {{-- Передаём данные в JavaScript --}}
</head>
<body>
<div id="app"></div>
<script>
    window.Laravel = {
        csrfToken: '{{ csrf_token() }}',
        user: @json(auth()->user()),
        appName: '{{ config('app.name') }}'
    }
</script>
</body>
</html>
