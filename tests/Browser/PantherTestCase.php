<?php

namespace Tests\Browser;

use Symfony\Component\Panther\PantherTestCase as BaseTestCase;
use Symfony\Component\Panther\Client;

abstract class PantherTestCase extends BaseTestCase
{
    protected static function getBaseUrl(): string
    {
        return 'http://94.41.87.10';
    }

    // Правильная сигнатура метода
    public static function createPantherClient(array $options = [], array $kernelOptions = [], array $managerOptions = []): Client
    {
        // Убеждаемся, что используем Chrome
        putenv('PANTHER_BROWSER=chrome');

        // Создаем клиент через родительский метод
        $client = parent::createPantherClient($options, $kernelOptions, $managerOptions);

        // Дополнительные настройки
        $client->getWebDriver()->manage()->timeouts()->implicitlyWait(10);

        return $client;
    }

    // Дополнительный метод для создания клиента с Chrome
    public static function createChromeClient()
    {
        return Client::createChromeClient(
            base_path('public/chromedriver_64.exe'),
            explode(' ', env('PANTHER_CHROME_ARGUMENTS', '')),
            [],
            'http://94.41.87.10'
        );
    }
}
