<?php

namespace Tests\Browser;

use Tests\Browser\PantherTestCase;
use Symfony\Component\Panther\Client;

class HomePageTest extends PantherTestCase
{
    public function testHomePageLoads()
    {
        // Способ 1: Используем кастомный метод для Chrome
        $client = static::createChromeClient();

        // Способ 2: Или используем стандартный метод
        // $client = static::createPantherClient();

        $client->request('GET', '/');

        // Упрощенная проверка
        $this->assertStringContainsString('Laravel', $client->getTitle());

        echo "\nTitle: " . $client->getTitle();
        echo "\nURL: " . $client->getCurrentURL();

        // Проверка статуса
        $status = $client->getInternalResponse()->getStatusCode();
        echo "\nStatus: $status";
        $this->assertEquals(200, $status);
    }
}
