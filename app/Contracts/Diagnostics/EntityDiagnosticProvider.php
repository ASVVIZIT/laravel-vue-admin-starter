<?php

namespace App\Contracts\Diagnostics;

interface EntityDiagnosticProvider
{
    /** Ключ сущности = папка в diagnostics/ и entities/. Пример: 'users'. */
    public function key(): string;

    /** Что умеет сущность: ['checks','inspector','crud','simulator','outbox']. */
    public function capabilities(): array;

    /**
     * Чек-лист проверок.
     * @return array<int, array{id: string, status: string, details: string, hint: string|null, cli: string|null}>
     * status: ok|warn|fail
     */
    public function checks(): array;

    /**
     * Карточка любого идентификатора (email, id...) БЕЗ мутаций данных.
     * @return array<string, mixed>
     */
    public function inspect(string $value): array;

    /**
     * Отчёт минимум-CRUD (create/read/update/delete) по боевым эндпоинтам.
     * @return array<int, array{step: string, status: string, code: int|null, duration_ms: int, details: string}>
     */
    public function crudSuite(): array;

    /**
     * Шаг симуляции потока сущности (dry-run, без реальной отправки писем).
     * @return array<string, mixed>
     */
    public function simulate(string $step, array $payload = []): array;
}
