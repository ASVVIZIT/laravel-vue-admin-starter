<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ForceDomain
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */

    public function handle(Request $request, Closure $next)
    {
        $debugMode = config('app.debug') || config('app.force_domain_debug');

        $host = $request->getHost();
        $port = $request->getPort();

        // Не обрабатывать запросы к консоли и заданиям
        if ($this->shouldSkipMiddleware($request)) {
            return $next($request);
        }
        // Логирование только в режиме отладки
        if ($debugMode) {
            Log::debug("ForceDomain: Request received", [
                'host' => $host,
                'port' => $port,
                'url' => $request->fullUrl(),
                'session_domain' => config('session.domain'),
                'sanctum_stateful' => config('sanctum.stateful')
            ]);
        }

        $sessionDomain = config('session.domain');

        // Обработка только если домен не установлен или в режиме 'auto'
        if (!$sessionDomain || $sessionDomain === 'auto') {
            $this->configureEnvironment($host, $port);
        }

        $response = $next($request);

        // Логирование после обработки только в debug mode
        if ($debugMode) {
            Log::debug("ForceDomain: Configuration applied", [
                'session_domain' => config('session.domain'),
                'sanctum_stateful' => config('sanctum.stateful')
            ]);
        }

        return $response;
    }

    /**
     * Определить, нужно ли пропустить middleware
     */
    protected function shouldSkipMiddleware(Request $request): bool
    {
        // Пропустить консольные команды и задачи в очереди
        if (app()->runningInConsole()) {
            return true;
        }

        // Пропустить внутренние системные запросы
        $path = $request->path();
        if (str_starts_with($path, 'horizon') ||
            str_starts_with($path, 'telescope') ||
            str_starts_with($path, 'health')) {
            return true;
        }

        return false;
    }

    /**
     * Конфигурирование окружения
     */
    protected function configureEnvironment(string $host, int $port): void
    {
        $domain = $this->determineDomain($host);
        config(['session.domain' => $domain]);
        $this->updateSanctumStatefulDomains($host, $port);
    }

    /**
     * Определить подходящий домен
     */
    protected function determineDomain(string $host): string
    {
        // Для локальных адресов
        if ($host === 'fenixlaravel.loc' || $host === '192.168.88.249') {
            return $host;
        }

        // Для IP-адресов
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $host;
        }

        $parts = explode('.', $host);
        $tld = end($parts);

        // Удалите точку для IP-адресов в продакшене
        if (app()->environment('production')) {
            return implode('.', array_slice($parts, -2, 2)); // Без точки!
        }

        // Локальные домены
        $localTlds = ['localhost', 'loc', 'test', 'local'];
        if (count($parts) === 1 || in_array($tld, $localTlds)) {
            return $host;
        }

        // Для production окружения используем основной домен с точкой
        if (app()->environment('production')) {
            return '.' . implode('.', array_slice($parts, -2, 2));
        }

        return $host;
    }

    /**
     * Обновить stateful domains для Sanctum
     */
    protected function updateSanctumStatefulDomains(string $host, int $port): void
    {
        // Получаем базовые домены из .env
        $baseDomains = array_map('trim', explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
            '%s%s',
            'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
            env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
        ))));

        // Получаем текущие домены из конфига
        $statefulDomains = array_unique(array_filter(array_merge(
            $baseDomains,
            config('sanctum.stateful', [])
        )));

        $newDomains = [];
        $portsToAdd = array_unique([80, 443, 8050, $port]);

        // Добавляем основной домен
        if (!in_array($host, $statefulDomains, true)) {
            $newDomains[] = $host;
        }

        // Добавляем домен с портами
        foreach ($portsToAdd as $portValue) {
            $domainWithPort = "$host:$portValue";
            if (!in_array($domainWithPort, $statefulDomains, true)) {
                $newDomains[] = $domainWithPort;
            }
        }

        // Обновляем конфигурацию
        if (!empty($newDomains)) {
            $updatedDomains = array_unique(array_merge($statefulDomains, $newDomains));
            config(['sanctum.stateful' => $updatedDomains]);

            if (config('app.debug')) {
                Log::debug("ForceDomain: Sanctum domains updated", [
                    'base_domains' => $baseDomains,
                    'added_domains' => $newDomains,
                    'updated_domains' => $updatedDomains
                ]);
            }
        }
    }
}
