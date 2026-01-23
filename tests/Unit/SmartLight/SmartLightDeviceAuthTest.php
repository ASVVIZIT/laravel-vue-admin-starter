<?php

namespace Tests\Unit\SmartLight;

use App\Http\Middleware\SmartLight\SmartLightDeviceAuth;
use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

class SmartLightDeviceAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->middleware = new SmartLightDeviceAuth();
    }

    /** @test */
    public function returns_error_when_missing_device_id()
    {
        $request = new Request([], [], ['device_id' => null]);
        $request->headers->set('X-Device-Key', 'valid_key');

        $response = $this->middleware->handle($request, function() {});

        $this->assertInstanceOf(Response::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        $this->assertStringContainsString('Missing required headers', $response->getContent());
    }

    /** @test */
    public function returns_error_when_missing_api_key()
    {
        $request = new Request([], [], ['device_id' => 'test-device']);
        $request->headers->set('X-Device-Key', null);

        $response = $this->middleware->handle($request, function() {});

        $this->assertInstanceOf(Response::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        $this->assertStringContainsString('Missing required headers', $response->getContent());
    }

    /** @test */
    public function returns_unauthorized_when_device_not_found()
    {
        $request = new Request([], [], ['device_id' => 'nonexistent-device']);
        $request->headers->set('X-Device-Key', 'invalid_key');

        $response = $this->middleware->handle($request, function() {});

        $this->assertInstanceOf(Response::class, $response);
        $this->assertEquals(401, $response->getStatusCode());
        $this->assertStringContainsString('Unauthorized device', $response->getContent());
    }

    /** @test */
    public function returns_critical_voltage_error_when_below_threshold()
    {
        $device = SmartLightDevice::factory()->create([
            'device_id' => 'low-voltage-device',
            'api_key' => 'valid_key',
            'voltage' => 2.8,
            'critical_voltage' => 3.0
        ]);

        $request = new Request([], [], ['device_id' => 'low-voltage-device']);
        $request->headers->set('X-Device-Key', 'valid_key');

        $response = $this->middleware->handle($request, function() {});

        $this->assertInstanceOf(Response::class, $response);
        $this->assertEquals(428, $response->getStatusCode());
        $this->assertStringContainsString('Critical voltage', $response->getContent());
        $this->assertStringContainsString('2.8', $response->getContent());
        $this->assertStringContainsString('3.0', $response->getContent());
    }

    /** @test */
    public function allows_request_when_device_authenticated()
    {
        $device = SmartLightDevice::factory()->create([
            'device_id' => 'valid-device',
            'api_key' => 'valid_key',
            'voltage' => 3.7,
            'critical_voltage' => 3.0
        ]);

        $request = new Request([], [], ['device_id' => 'valid-device']);
        $request->headers->set('X-Device-Key', 'valid_key');

        $called = false;
        $response = $this->middleware->handle($request, function($req) use (&$called, $device) {
            $called = true;
            $this->assertEquals($device, $req->device);
            return new Response('Success');
        });

        $this->assertTrue($called);
        $this->assertInstanceOf(Response::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('Success', $response->getContent());
    }

    /** @test */
    public function handles_multiple_concurrent_requests()
    {
        $device1 = SmartLightDevice::factory()->create([
            'device_id' => 'device-1',
            'api_key' => 'key-1',
            'voltage' => 3.8
        ]);

        $device2 = SmartLightDevice::factory()->create([
            'device_id' => 'device-2',
            'api_key' => 'key-2',
            'voltage' => 3.5
        ]);

        // Запрос для первого устройства
        $request1 = new Request([], [], ['device_id' => 'device-1']);
        $request1->headers->set('X-Device-Key', 'key-1');

        $response1 = $this->middleware->handle($request1, function($req) use ($device1) {
            $this->assertEquals($device1, $req->device);
            return new Response('Device 1 authenticated');
        });

        $this->assertEquals(200, $response1->getStatusCode());

        // Запрос для второго устройства
        $request2 = new Request([], [], ['device_id' => 'device-2']);
        $request2->headers->set('X-Device-Key', 'key-2');

        $response2 = $this->middleware->handle($request2, function($req) use ($device2) {
            $this->assertEquals($device2, $req->device);
            return new Response('Device 2 authenticated');
        });

        $this->assertEquals(200, $response2->getStatusCode());
    }
}
