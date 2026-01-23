<?php

namespace Tests\Unit\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\PowerManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PowerManagerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->powerManager = new PowerManager();
    }

    /** @test */
    public function calculates_runtime_for_li_ion_battery()
    {
        $device = new SmartLightDevice([
            'voltage' => 3.7,
            'battery_capacity' => 2000,
            'critical_voltage' => 3.0
        ]);

        $runtime = $this->powerManager->calculateRuntime($device);

        // Ожидаем примерно 3-4 дня работы
        $this->assertMatchesRegularExpression('/\d+(?:\.\d+)? дня?/', $runtime);
    }

    /** @test */
    public function returns_critical_message_for_low_voltage()
    {
        $device = new SmartLightDevice([
            'voltage' => 2.9,
            'battery_capacity' => 2000,
            'critical_voltage' => 3.0
        ]);

        $runtime = $this->powerManager->calculateRuntime($device);

        $this->assertEquals('КРИТИЧЕСКИЙ ЗАРЯД', $runtime);
    }

    /** @test */
    public function calculates_runtime_in_hours_when_less_than_one_day()
    {
        $device = new SmartLightDevice([
            'voltage' => 3.3,
            'battery_capacity' => 2000,
            'critical_voltage' => 3.0
        ]);

        $runtime = $this->powerManager->calculateRuntime($device);

        $this->assertMatchesRegularExpression('/\d+ часа?/', $runtime);
    }

    /** @test */
    public function calculates_runtime_for_lead_acid_battery()
    {
        $device = new SmartLightDevice([
            'voltage' => 12.0,
            'battery_capacity' => 50000,
            'critical_voltage' => 11.0
        ]);

        $runtime = $this->powerManager->calculateRuntime($device);

        // Для большой емкости ожидаем много дней
        $this->assertMatchesRegularExpression('/\d+(?:\.\d+)? дня?/', $runtime);
    }

    /** @test */
    public function formats_runtime_correctly_for_different_values()
    {
        // 1 день
        $this->assertEquals('1 день', $this->invokePrivateMethod('formatRuntime', [1.0]));

        // 1.5 дня
        $this->assertEquals('1.5 дня', $this->invokePrivateMethod('formatRuntime', [1.5]));

        // 2 дня
        $this->assertEquals('2 дня', $this->invokePrivateMethod('formatRuntime', [2.0]));

        // 5 дней
        $this->assertEquals('5 дней', $this->invokePrivateMethod('formatRuntime', [5.0]));

        // 0.5 дня = 12 часов
        $this->assertEquals('12 часов', $this->invokePrivateMethod('formatRuntime', [0.5]));

        // 0.1 дня = 2 часа
        $this->assertEquals('2 часа', $this->invokePrivateMethod('formatRuntime', [0.1]));
    }

    /** @test */
    public function declines_word_correctly()
    {
        $this->assertEquals('час', $this->invokePrivateMethod('declineWord', [1, ['час', 'часа', 'часов']]));
        $this->assertEquals('часа', $this->invokePrivateMethod('declineWord', [2, ['час', 'часа', 'часов']]));
        $this->assertEquals('часа', $this->invokePrivateMethod('declineWord', [4, ['час', 'часа', 'часов']]));
        $this->assertEquals('часов', $this->invokePrivateMethod('declineWord', [5, ['час', 'часа', 'часов']]));
        $this->assertEquals('часов', $this->invokePrivateMethod('declineWord', [11, ['час', 'часа', 'часов']]));
        $this->assertEquals('час', $this->invokePrivateMethod('declineWord', [21, ['час', 'часа', 'часов']]));
        $this->assertEquals('часа', $this->invokePrivateMethod('declineWord', [22, ['час', 'часа', 'часов']]));
    }

    /**
     * Вспомогательный метод для вызова приватных методов
     */
    private function invokePrivateMethod($methodName, $parameters = [])
    {
        $reflection = new \ReflectionClass(PowerManager::class);
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs($this->powerManager, $parameters);
    }
}
