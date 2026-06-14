<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'FenixPortal') }}</title>

    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">
    <meta name="theme-color" content="#ffffff">

    {{-- Подключаем public.js через наш хелпер --}}
    {{ vite_public_assets() }}
</head>
<body>
{{-- Корневой элемент для Vue --}}
<div id="public-app"></div>

{{-- Передаём данные в JavaScript --}}
<script>
    window.Laravel = {
        csrfToken: '{{ csrf_token() }}',
        user: @json(auth()->user()),
        appName: '{{ config('app.name') }}'
    }
</script>
</body>
</html>
