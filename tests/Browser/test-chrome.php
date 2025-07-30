<?php

require 'vendor/autoload.php';

use Symfony\Component\Panther\Client;

try {
    $client = Client::createChromeClient(
        __DIR__.'/public/chromedriver_64.exe',
        [],
        [],
        [
            'port' => 8000,
            'webServerDir' => __DIR__.'/public',
        ]
    );

    $client->request('GET', 'http://94.41.87.10/');
    echo "Title: ".$client->getTitle()."\n";
    echo "URL: ".$client->getCurrentURL()."\n";
    $client->takeScreenshot('test-success.png');
    echo "Screenshot saved!\n";
} catch (Exception $e) {
    echo "ERROR: ".$e->getMessage()."\n";
}
