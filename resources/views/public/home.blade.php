<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- ✅ ПУБЛИЧНЫЙ заголовок --}}
    <title>{{ config('app.name', 'FenixPortal') }}</title>

    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">
    <meta name="theme-color" content="#ffffff">

    {{-- ✅ ПУБЛИЧНЫЕ ассеты --}}
    {!! vite_public_assets() !!}
</head>
<body>
<div id="public-app"></div>

{{-- ✅ МИНИМАЛЬНЫЕ данные --}}
<script>
    window.Laravel = {
        csrfToken: '{{ csrf_token() }}',
        appName: '{{ config('app.name') }}'
    };
</script>
</body>
</html>
