<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Старая главная страница (для обратной совместимости)
     */
    public function index()
    {
        // ✅ Редирект на новую публичную часть
        return redirect('/');

        // ИЛИ отдай старый view:
        // return view('home');
    }
}
