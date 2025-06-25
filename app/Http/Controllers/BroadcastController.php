<?php
// App/Http/Controllers/BroadcastController.php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;
class BroadcastController extends Controller
{
    public function authenticate(Request $request)
    {
        return Broadcast::auth($request);
    }
}
