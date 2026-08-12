# FenixPortal Monolith — Карта проекта

## Стек
- Backend: Laravel 10 / PHP 8.2 / Sanctum / Reverb / Spatie
- Frontend: Vue 3.5 (script setup) / TS strict / Pinia / ElementPlus
- Сборка: Vite 5 (custom manualChunks)
- Сервер: Win10 + OpenServer 5.4.1

## Архитектурные соглашения
- Ответы backend: ТОЛЬКО responseSuccess/responseFailed
- 3 типа пользователей: admin/user/tester
- Guards: динамические роуты через permission.generateRoutes()
- Редиректы: ТОЛЬКО window.location.href через getSavedBasePath()
- Blade хелперы: vite_assets / vite_admin_assets / vite_public_assets
- Конфиги 3 уровня: backend config → /api/auth/config → settings.js+appStore
- НЕ дублировать бизнес-логику/списки в JS

## Структура (ключевые директории)
resources/js/
├── api/           — axios запросы к backend
├── store/         — Pinia (auth, user, permission, app)
├── utils/         — хелперы (auth, detectBasePath, etc)
├── modules/       — изолированные модули (TalkStream, SmartLight, Landing)
├── components/    — общие UI компоненты
├── views/         — страницы
└── router/        — маршрутизация

## Текущая задача / проблема
[заполняется по ходу работы]
