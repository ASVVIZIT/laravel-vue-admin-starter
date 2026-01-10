<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\SmartLightDevice;

class PowerManager
{
    public function calculateRuntime(SmartLightDevice $device): string
    {
        $currentVoltage = $device->voltage;
        $batteryCapacity = $device->battery_capacity;

        if ($currentVoltage <= $device->critical_voltage) {
            return 'КРИТИЧЕСКИЙ ЗАРЯД';
        }

        // Среднее потребление (из ваших замеров)
        $lightCurrent = 40; // mA
        $espCurrent = 0.5;  // mA

        // Расчёт оставшейся ёмкости
        $remainingCapacity = $batteryCapacity * (($currentVoltage - 2.8) / (4.2 - 2.8));

        // Суточное потребление
        $dailyConsumption = ($lightCurrent * 10) + ($espCurrent * 24);

        // Расчёт дней
        $days = $remainingCapacity / $dailyConsumption;

        return $this->formatRuntime($days);
    }

    private function formatRuntime(float $days): string
    {
        if ($days < 1) {
            $hours = round($days * 24);
            return $hours . ' ' . $this->declineWord($hours, ['час', 'часа', 'часов']);
        }

        if ($days < 2) {
            return '1 день';
        }

        return round($days, 1) . ' ' . $this->declineWord(floor($days), ['день', 'дня', 'дней']);
    }

    private function declineWord(int $number, array $words): string
    {
        $number = abs($number) % 100;
        $lastDigit = $number % 10;

        if ($number > 10 && $number < 20) {
            return $words[2];
        }

        if ($lastDigit === 1) {
            return $words[0];
        }

        if ($lastDigit >= 2 && $lastDigit <= 4) {
            return $words[1];
        }

        return $words[2];
    }
}
