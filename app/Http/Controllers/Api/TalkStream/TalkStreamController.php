<?php

namespace App\Http\Controllers\Api\TalkStream;


use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use function event;
use function response;

class TalkStreamController extends Controller
{
    public function contacts()
    {
        return User::where('id', '!=', auth()->id())->get();
    }
}
