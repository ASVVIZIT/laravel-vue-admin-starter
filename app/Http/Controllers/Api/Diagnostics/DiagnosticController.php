<?php

namespace App\Http\Controllers\Api\Diagnostics;

use App\Contracts\Diagnostics\EntityDiagnosticProvider;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class DiagnosticController extends BaseController
{
    /** Реестр сущностей и возможностей для вкладок UI. */
    public function config(): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }

        $entities = [];
        foreach (config('diagnostics.entities', []) as $key => $definition) {
            $entities[] = [
                'key' => $key,
                'capabilities' => $this->provider($key)->capabilities(),
                'cli' => $definition['cli'] ?? null,
            ];
        }

        return responseSuccess([
            'enabled' => (bool) config('diagnostics.enabled'),
            'outbox_ttl' => (int) config('diagnostics.outbox_ttl'),
            'entities' => $entities,
        ]);
    }

    /** Чек-лист сущности со сводкой ok/warn/fail. */
    public function checks(string $entity): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $checks = $this->provider($entity)->checks();

        $summary = [
            'ok' => count(array_filter($checks, fn(array $item): bool => $item['status'] === 'ok')),
            'warn' => count(array_filter($checks, fn(array $item): bool => $item['status'] === 'warn')),
            'fail' => count(array_filter($checks, fn(array $item): bool => $item['status'] === 'fail')),
        ];

        return responseSuccess([
            'entity' => $entity,
            'checks' => $checks,
            'summary' => $summary,
        ]);
    }

    /** Карточка идентификатора (B1: заглушка провайдера, реализация в B3). */
    public function inspect(string $entity, Request $request): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $validator = Validator::make($request->all(), [
            'value' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors());
        }

        return responseSuccess([
            'entity' => $entity,
            'card' => $this->provider($entity)->inspect($request->input('value')),
        ]);
    }

    /** CRUD-сюит (B1: пустой отчёт, реализация в B2-бэке P2). */
    public function crud(string $entity): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $report = $this->provider($entity)->crudSuite();

        return responseSuccess(
            ['entity' => $entity, 'report' => $report],
            empty($report) ? 'CRUD-сюит для сущности ещё не реализован' : 'CRUD-сюит завершён'
        );
    }

    /** Шаг симуляции (B1: заглушка провайдера, реализация в B4). */
    public function simulate(string $entity, Request $request): JsonResponse
    {
        if ($blocked = $this->guardEnabled()) {
            return $blocked;
        }
        if ($blocked = $this->guardEntity($entity)) {
            return $blocked;
        }

        $validator = Validator::make($request->all(), [
            'step' => ['required', 'string', 'max:50'],
            'payload' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors());
        }

        return responseSuccess([
            'entity' => $entity,
            'result' => $this->provider($entity)->simulate($request->input('step'), $request->input('payload', [])),
        ]);
    }

    // ========================================================================
    // ПРИВАТНЫЕ ХЕЛПЕРЫ
    // ========================================================================

    private function guardEnabled(): ?JsonResponse
    {
        if (config('diagnostics.enabled')) {
            return null;
        }

        return responseFailed('Диагностика отключена', Response::HTTP_NOT_FOUND);
    }

    private function guardEntity(string $entity): ?JsonResponse
    {
        $validator = Validator::make(
            ['entity' => $entity],
            ['entity' => ['required', 'string', Rule::in(array_keys(config('diagnostics.entities', [])))]]
        );

        if ($validator->fails()) {
            return responseFailed('Неизвестная сущность диагностики: ' . $entity, Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return null;
    }

    private function provider(string $entity): EntityDiagnosticProvider
    {
        $definition = config("diagnostics.entities.{$entity}");

        return app($definition['provider']);
    }
}
