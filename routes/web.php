<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// routes/web.php

// RouteServiceProvider загружает index.html
Route::get('/{any}', function () {
    return view('index');
})->where('any', '.*');

Route::group(['middleware' => 'web'], function () {
    Route::get('', 'HomeController@index')->where('any', '.*');
});

/*Route::get('/debug-broadcast', function() {
    return Broadcast::auth(request());
});

Route::get('/test-ws', function() {
    try {
        $socket = @fsockopen('94.41.87.10', 8070, $errno, $errstr, 2);

        if ($socket) {
            fwrite($socket, "GET /ws HTTP/1.1\r\nHost: 94.41.87.10\r\n\r\n");
            $response = fread($socket, 1024);
            fclose($socket);

            return response()->json([
                'status' => 'success',
                'response' => $response
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => "$errstr ($errno)"
        ], 500);

    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'exception',
            'message' => $e->getMessage()
        ], 500);
    }
});*/
