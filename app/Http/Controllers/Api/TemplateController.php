<?php

namespace App\Http\Controllers\Api;

use App\Models\TableRow;
use App\Models\Template;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Request;

class TemplateController extends Controller
{
    public function show($id)
    {
        $template = Template::with('columns')->findOrFail($id);
        return response()->json([
            'id' => $template->id,
            'name' => $template->name,
            'columns' => $template->columns // Гарантированное наличие поля
        ]);
    }

// TableRowController.php
    public function index(Request $request)
    {
        return response()->json(
            TableRow::where('template_id', $request->template_id)
                ->whereNull('parent_id')
                ->with('children')
                ->get()
        )->header('Access-Control-Allow-Origin', env('ALLOWED_ORIGINS'));
    }
}
