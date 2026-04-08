<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\SmartLightUser;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * ============================================================================
 * DEVICE SERVICE — БИЗНЕС-ЛОГИКА УСТРОЙСТВ ОСВЕЩЕНИЯ
 * ============================================================================
 * 📁 Путь: app/Services/SmartLight/DeviceService.php
 * ✅ Назначение: Фильтрация, пагинация, управление состоянием устройств
 * ✅ Архитектура: Делегирует проверку прав в SmartLightUser (без дублирования)
 * ✅ Не трогает app/Models/User.php — чистая изоляция
 * ============================================================================
 */

class DeviceService
{
    // ========================================================================
    // 🔍 ПОЛУЧЕНИЕ УСТРОЙСТВ С ФИЛЬТРАМИ
    // ========================================================================

    /**
     * Получить устройства с фильтрами и пагинацией (для lazy load на фронтенде)
     *
     * @param array $filters ['tab' => 'all'|'real'|'fake'|'personal', 'search' => '', 'status' => '', 'battery_type_id' => '']
     * @param int $perPage Количество на страницу (по умолчанию 200 для lazy load)
     * @param int $page Номер страницы
     * @return LengthAwarePaginator
     */
    public function getDevicesWithFilters(array $filters = [], int $perPage = 200, int $page = 1): LengthAwarePaginator
    {
        $query = SmartLightDevice::with(['batteryType', 'bulbType', 'powerSupply']);

        // 🔐 1. Фильтрация по правам доступа (делегирование в скоуп модели)
        $query->forSmartLightUser();

        // 🎯 2. Фильтр по вкладке (real/fake/personal) — применяется ПОСЛЕ прав
        $this->applyTabFilter($query, $filters['tab'] ?? 'all');

        // 🔍 3. Поиск по имени или device_id
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('device_id', 'like', "%{$filters['search']}%");
            });
        }

        // 📊 4. Фильтр по статусу
        if (!empty($filters['status']) && in_array($filters['status'], ['ON', 'OFF', 'SLEEPING', 'ERROR'])) {
            $query->where('status', $filters['status']);
        }

        // 🔋 5. Фильтр по типу батареи
        if (!empty($filters['battery_type_id'])) {
            $query->where('battery_type_id', $filters['battery_type_id']);
        }

        // 📦 6. Сортировка: сначала по имени, потом по device_id (стабильный порядок)
        $query->orderBy('name', 'asc')
            ->orderBy('device_id', 'asc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Применить фильтр по вкладке (real/fake/personal)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $tab
     * @return void
     */
    private function applyTabFilter($query, string $tab): void
    {
        match ($tab) {
            'real'   => $query->where('is_fake', false),
            'fake'   => $query->where('is_fake', true),
            'personal' => $query->where('user_id', Auth::id()),
            default  => null, // 'all' или неизвестное — без дополнительного фильтра
        };
    }

    /**
     * Получить доступные вкладки для текущего пользователя
     * ✅ Делегирует в SmartLightUser — не дублируем логику прав
     *
     * @return array<array{id:string,label:string,icon:string}>
     */
    public function getAvailableTabs(): array
    {
        $currentUser = SmartLightUser::current();
        return $currentUser ? $currentUser->getSmartLightTabs() : [['id' => 'personal', 'label' => 'Мои', 'icon' => 'User']];
    }

    // ========================================================================
    // 🔐 ПРОВЕРКА ДОСТУПА К КОНКРЕТНОМУ УСТРОЙСТВУ
    // ========================================================================

    /**
     * Найти устройство по device_id с проверкой прав
     *
     * @param string $deviceId
     * @return SmartLightDevice
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findDeviceByDeviceId(string $deviceId): SmartLightDevice
    {
        $device = SmartLightDevice::where('device_id', $deviceId)->firstOrFail();
        $this->checkAccess($device);
        return $device;
    }

    /**
     * Проверить, имеет ли текущий пользователь доступ к устройству
     *
     * @param SmartLightDevice $device
     * @return void
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    private function checkAccess(SmartLightDevice $device): void
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Требуется авторизация');
        }

        // ✅ Делегируем проверку в модель пользователя
        $slUser = $user instanceof SmartLightUser ? $user : new SmartLightUser((array) $user->getAttributes());

        $canManageAll = $slUser->canManageAllSmartLights();
        $isOwn = $device->user_id === $user->id;

        if (!$canManageAll && !$isOwn) {
            abort(403, 'Доступ запрещён');
        }
    }

    // ========================================================================
    // ⚡ УПРАВЛЕНИЕ СОСТОЯНИЕМ УСТРОЙСТВА
    // ========================================================================

    /**
     * Обновить напряжение устройства с валидацией по типу контроллера
     *
     * @param SmartLightDevice $device
     * @param float $voltage
     * @return SmartLightDevice
     */
    public function updateDeviceVoltage(SmartLightDevice $device, float $voltage): SmartLightDevice
    {
        $limits = [
            'node_mcu_v3' => [2.5, 4.2],
            'esp32'       => [2.5, 4.2],
            'esp8266'     => [2.5, 4.2],
            'raspberry_pi'=> [4.75, 5.25],
        ];

        $range = $limits[$device->device_type] ?? [2.5, 4.2];
        $device->voltage = max($range[0], min($range[1], $voltage));
        $device->save();

        return $device;
    }

    /**
     * Перевести устройство в спящий режим (экстренный сон)
     *
     * @param SmartLightDevice $device
     * @return SmartLightDevice
     */
    public function forceSleep(SmartLightDevice $device): SmartLightDevice
    {
        $device->status = 'SLEEPING';
        // Эмуляция снижения напряжения при переходе в сон (на 20%, но не ниже 2.5В)
        $device->voltage = max(2.5, ($device->voltage ?? 3.7) * 0.8);
        $device->save();

        return $device;
    }

    /**
     * Пробудить устройство (восстановить нормальное напряжение)
     *
     * @param SmartLightDevice $device
     * @return SmartLightDevice
     */
    public function wakeDevice(SmartLightDevice $device): SmartLightDevice
    {
        $device->status = 'ON';
        // Восстанавливаем "нормальное" напряжение в зависимости от типа контроллера
        $defaults = ['node_mcu_v3' => 3.7, 'esp32' => 3.7, 'esp8266' => 3.7, 'raspberry_pi' => 5.0];
        $device->voltage = $defaults[$device->device_type] ?? 3.7;
        $device->save();

        return $device;
    }

    // ========================================================================
    // 📊 РАСЧЁТЫ И ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ========================================================================

    /**
     * Рассчитать оставшееся время работы с учётом общего источника питания
     *
     * @param SmartLightDevice $device
     * @return array{light_only_runtime:string,controller_only_runtime:string,remaining_capacity_mah:float,total_capacity_mah:int,current_voltage:float}
     */
    public function calculateSharedPowerRuntime(SmartLightDevice $device): array
    {
        $totalCapacity = $device->battery_capacity ?? 2000;
        $currentVoltage = $device->voltage ?? 3.7;

        // Оценка оставшейся ёмкости (линейная аппроксимация для простоты)
        $minV = 2.8; $maxV = 4.2;
        $remainingCapacity = $totalCapacity * max(0, min(1, ($currentVoltage - $minV) / ($maxV - $minV)));

        // Потребление: контроллер + лампа (зависит от интенсивности)
        $controllerConsumption = 0.5; // мА
        $lightConsumption = 40 + (($device->intensity ?? 0) * 0.5); // мА

        $lightRuntime = $remainingCapacity / max(0.1, $lightConsumption);
        $controllerRuntime = $remainingCapacity / max(0.1, $controllerConsumption);

        return [
            'light_only_runtime'      => $this->formatRuntime($lightRuntime),
            'controller_only_runtime' => $this->formatRuntime($controllerRuntime),
            'remaining_capacity_mah'  => round($remainingCapacity, 1),
            'total_capacity_mah'      => $totalCapacity,
            'current_voltage'         => $currentVoltage,
        ];
    }

    /**
     * Форматировать время в человекочитаемый вид (с склонением)
     *
     * @param float $hours
     * @return string
     */
    private function formatRuntime(float $hours): string
    {
        if ($hours < 1) {
            $minutes = (int) round($hours * 60);
            return "{$minutes} " . $this->declineWord($minutes, ['минута', 'минуты', 'минут']);
        }

        if ($hours < 24) {
            $h = (int) floor($hours);
            return "{$h} " . $this->declineWord($h, ['час', 'часа', 'часов']);
        }

        $days = (int) floor($hours / 24);
        return "{$days} " . $this->declineWord($days, ['день', 'дня', 'дней']);
    }

    /**
     * Склонение русских слов (1 день, 2 дня, 5 дней)
     *
     * @param int $number
     * @param array<string> $words [singular, dual, plural]
     * @return string
     */
    private function declineWord(int $number, array $words): string
    {
        $n = abs($number) % 100;
        $d = $n % 10;

        if ($n > 10 && $n < 20) return $words[2];
        if ($d === 1) return $words[0];
        if ($d >= 2 && $d <= 4) return $words[1];
        return $words[2];
    }

    // ========================================================================
    // 📦 ПРОСТЫЕ МЕТОДЫ ПОЛУЧЕНИЯ (для внутренних нужд)
    // ========================================================================

    public function getRealDevices(): array
    {
        return SmartLightDevice::real()->orderBy('name')->get()->toArray();
    }

    public function getFakeDevices(): array
    {
        return SmartLightDevice::fake()->orderBy('name')->get()->toArray();
    }
}
