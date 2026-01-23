<?php

namespace Tests\Unit\SmartLight;

use App\Models\SmartLight\GlobalSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GlobalSettingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_get_setting_by_key()
    {
        GlobalSetting::create([
            'key' => 'test_key',
            'value' => 'test_value'
        ]);

        $value = GlobalSetting::get('test_key');

        $this->assertEquals('test_value', $value);
    }

    /** @test */
    public function returns_default_when_setting_not_found()
    {
        $value = GlobalSetting::get('nonexistent_key', 'default_value');

        $this->assertEquals('default_value', $value);
    }

    /** @test */
    public function can_set_setting_value()
    {
        $result = GlobalSetting::set('new_key', 'new_value');

        $this->assertTrue($result);

        $this->assertDatabaseHas('smart_light_settings', [
            'key' => 'new_key',
            'value' => 'new_value'
        ]);
    }

    /** @test */
    public function can_get_all_settings()
    {
        GlobalSetting::create([
            'key' => 'key1',
            'value' => 'value1'
        ]);

        GlobalSetting::create([
            'key' => 'key2',
            'value' => 'value2'
        ]);

        $settings = GlobalSetting::getAll();

        $this->assertIsArray($settings);
        $this->assertCount(2, $settings);
        $this->assertEquals('value1', $settings['key1']);
        $this->assertEquals('value2', $settings['key2']);
    }

    /** @test */
    public function handles_numeric_values_correctly()
    {
        GlobalSetting::set('numeric_key', 123.45);

        $value = GlobalSetting::get('numeric_key');

        $this->assertEquals('123.45', $value);
    }

    /** @test */
    public function handles_null_values_correctly()
    {
        GlobalSetting::set('null_key', null);

        $value = GlobalSetting::get('null_key', 'default');

        $this->assertEquals('default', $value);
    }

    /** @test */
    public function handles_special_characters_in_values()
    {
        $specialValue = 'value with spaces & special chars: !@#$%^&*()';
        GlobalSetting::set('special_key', $specialValue);

        $value = GlobalSetting::get('special_key');

        $this->assertEquals($specialValue, $value);
    }

    /** @test */
    public function updates_existing_setting()
    {
        GlobalSetting::create([
            'key' => 'update_key',
            'value' => 'old_value'
        ]);

        GlobalSetting::set('update_key', 'new_value');

        $this->assertDatabaseHas('smart_light_settings', [
            'key' => 'update_key',
            'value' => 'new_value'
        ]);

        $this->assertDatabaseMissing('smart_light_settings', [
            'key' => 'update_key',
            'value' => 'old_value'
        ]);
    }

    /** @test */
    public function handles_empty_values()
    {
        GlobalSetting::set('empty_key', '');

        $value = GlobalSetting::get('empty_key', 'default');

        $this->assertEquals('', $value);
    }
}
