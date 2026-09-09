# Diagnostics — dev-утилиты диагностики и разовых правок данных

Каталог содержит консольные скрипты для аудита состояния сущностей и разовых
исправлений данных. Скрипты НЕ участвуют в рантайме приложения — запускаются
вручную из консоли разработчиком.

## Структура

Одна подпапка = одна диагностируемая сущность:

```
diagnostics/
├── README.md                                  ← этот файл (легенда)
├── users/                                     ← пользователи / email-поток
│   ├── diag_user_statuses.php                 ← аудит (только чтение)
│   ├── fix_email_verified_at.php              ← правка данных
│   └── restore_confirm_methods.php            ← правка данных
└── permissions/                               ← права доступа (Spatie)
    ├── check_confirm_email_permission.php     ← аудит (только чтение)
    └── grant_confirm_email_permission.php     ← правка данных
```

## Общие правила

1. **Только CLI.** Каждый скрипт защищён guard'ом `php_sapi_name() !== 'cli'` —
   через веб не запустится.
2. **Запуск из корня проекта:**
   ```powershell
   php diagnostics/<сущность>/<скрипт>.php
   ```
3. **Пути автозагрузки** внутри скриптов: `__DIR__ . '/../../'` (скрипты лежат
   на два уровня ниже корня). При переносе скрипта — поправить пути.
4. **Идемпотентность.** Fix-скрипты применяют изменения только к записям,
   подходящим под строгие критерии. Повторный запуск безопасен.
5. **Не трогают:** активные процессы смены email (`pending_new_email` не null)
   и soft-deleted записи — если иное не оговорено в шапке скрипта.
6. **После правок прав** — сброс кэша Spatie выполняется самим скриптом;
   на фронте нужен повторный вход (authStore перечитывает права).
7. Скрипты — часть репозитория, коммитятся вместе с кодом.

## Сущность: users

### `users/diag_user_statuses.php` — аудит, только чтение

Показывает:
1. Наличие полей email-процесса в `User::$fillable`
2. Состояние полей процесса у каждого пользователя с активным/завершённым процессом
3. Сводку статусов: total / verified / unverified / trashed / banned
4. Расчёт `hasVerifiedEmail()` и `getStatusType()` на контрольном пользователе

```powershell
php diagnostics/users/diag_user_statuses.php

# другой контрольный пользователь:
$env:DIAG_EMAIL='user@fenix.dev'; php diagnostics/users/diag_user_statuses.php
```

Данные НЕ изменяет.

### `users/fix_email_verified_at.php` — правка

Проставляет `email_verified_at = now()` пользователям, у которых смена email
ЗАВЕРШЕНА (`new_email_confirm_method` заполнен), нет активного запроса, но
верификация не записалась (исторический баг: поле отсутствовало в `$fillable`).

Не трогает: методы подтверждения, активные запросы, soft-deleted.

```powershell
php diagnostics/users/fix_email_verified_at.php
```

### `users/restore_confirm_methods.php` — правка

Восстанавливает `old/new_email_confirm_method` из журнала событий (`logs`)
по заголовкам:

| Заголовок журнала | Восстанавливает |
|---|---|
| Old Email Confirmed | old_email_confirm_method = 'email' |
| Admin Email Old Confirmed | old_email_confirm_method = 'admin' |
| Email Changed | new_email_confirm_method = 'email' |
| Admin Email Changed | new_email_confirm_method = 'admin' |

Не трогает пользователей с активным запросом смены.

```powershell
php diagnostics/users/restore_confirm_methods.php
```

## Сущность: permissions

### `permissions/check_confirm_email_permission.php` — аудит, только чтение

Проверяет: существует ли право `confirm user email` и выдано ли ролям
`admin` / `superadmin`.

```powershell
php diagnostics/permissions/check_confirm_email_permission.php
```

### `permissions/grant_confirm_email_permission.php` — правка

Создаёт право `confirm user email` (firstOrCreate), выдаёт ролям `admin` и
`superadmin`, сбрасывает кэш Spatie.

```powershell
php diagnostics/permissions/grant_confirm_email_permission.php
```

После выполнения — повторный вход на фронте.

## Типовые сценарии (playbook)

### Звёзды не видны в таблице пользователей
1. `php diagnostics/permissions/check_confirm_email_permission.php`
2. Если `NO` → `php diagnostics/permissions/grant_confirm_email_permission.php`
3. Повторный вход на фронте → обновить таблицу.

### Статус «Не подтвержден», хотя смена email завершена
1. `php diagnostics/users/diag_user_statuses.php` → убедиться:
   `email_verified_at: NULL`, методы заполнены
2. `php diagnostics/users/fix_email_verified_at.php`
3. Обновить таблицу/карточку.

### Звёзды серые, хотя в хронологии есть завершённая смена
1. `php diagnostics/users/diag_user_statuses.php` → методы `NULL`
2. `php diagnostics/users/restore_confirm_methods.php`
3. Обновить таблицу/карточку.

## Как добавить новый скрипт

1. Определи сущность → подпапка (`diagnostics/<сущность>/`); новой сущности —
   новая подпапка (например `diagnostics/talkstream/`).
2. Имя файла по префиксу назначения:
    - `diag_*` — аудит, только чтение
    - `check_*` — точечная проверка
    - `fix_*` — разовая правка данных по критериям
    - `restore_*` / `grant_*` — восстановление/выдача из источника истины
3. Обязательная шапка скрипта:

```php
<?php

/**
 * НАЗНАЧЕНИЕ: что делает.
 * Запуск: php diagnostics/<сущность>/<имя>.php
 * ТРОГАЕТ: ... / НЕ ТРОГАЕТ: ...
 */

if (php_sapi_name() !== 'cli') {
    exit('CLI only');
}

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
```

4. Скрипт ОБЯЗАН выводить итог работы (сколько записей затронуто).
5. Добавь описание скрипта в этот README (раздел сущности + playbook при
   необходимости).
