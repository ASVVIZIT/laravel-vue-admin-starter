<?php

namespace App\Services\Diagnostics;

use App\Contracts\Diagnostics\EntityDiagnosticProvider;

abstract class AbstractEntityProvider implements EntityDiagnosticProvider
{
    /** Базовый набор возможностей: только чек-лист. Остальное подключают наследники. */
    public function capabilities(): array
    {
        return ['checks'];
    }

    /** По умолчанию инспектор не поддержан: сущность подключит его в своём классе. */
    public function inspect(string $value): array
    {
        return ['supported' => false, 'value' => $value];
    }

    /** По умолчанию CRUD-сюит не реализован: пустой отчёт. */
    public function crudSuite(): array
    {
        return [];
    }

    /** По умолчанию симулятор не поддержан. */
    public function simulate(string $step, array $payload = []): array
    {
        return ['supported' => false, 'step' => $step];
    }

    /** Конструктор строки проверки чек-листа. */
    protected function check(string $id, string $status, string $details, ?string $hint = null, ?string $cli = null): array
    {
        return [
            'id' => $id,
            'status' => $status, // ok|warn|fail
            'details' => $details,
            'hint' => $hint,
            'cli' => $cli,
        ];
    }

    /** URL Vue SPA для ссылок (тот же источник, что у ссылок из писем). */
    protected function frontendUrl(string $path): string
    {
        $baseUrl = config('app.frontend.url', config('app.url'));
        return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    }

    /** Готовая команда CLI-скрипта из diagnostics/ для подсказки в UI. */
    protected function cliCommand(string $path): string
    {
        return 'php diagnostics/' . ltrim($path, '/');
    }

    /** Входит ли домен email в белый список симуляций. */
    protected function isWhitelistedEmail(string $email): bool
    {
        $domain = substr(strrchr($email, '@'), 1);
        $whitelist = config('diagnostics.whitelist_domains', []);

        return in_array(strtolower($domain ?: ''), $whitelist, true);
    }

    /**
     * Получить инструкции по исправлению для конкретной проверки.
     * По умолчанию — нет инструкций.
     */
    public function getFixInstructions(string $checkId): ?array
    {
        return null;
    }
}
