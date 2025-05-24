<?php

namespace App\Http\Controllers\Api;

use App\Models\TableRow;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TableRowController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('Auth user:', ['user' => auth()->user()]);

        \Log::info('TableRowController request:', [
            'params' => $request->all(),
            'template_id' => $request->template_id,
            'parent_id' => $request->parent_id
        ]);

        $query = TableRow::where('template_id', $request->template_id)
            ->where('parent_id', $request->parent_id)
            ->with(['children' => function($query) {
                $query->orderBy('order');
            }])
            ->orderBy('order');

        $rows = $query->get();

        \Log::debug('TableRowController SQL query:', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings()
        ]);

        $responseData = $rows->map(function ($row) {
            return [
                'id' => $row->id,
                'data' => $row->data,
                'has_children' => $row->children->isNotEmpty(),
                'children' => $row->children->map(function($child) {
                    return [
                        'id' => $child->id,
                        'data' => $child->data,
                        'has_children' => $child->children->isNotEmpty()
                    ];
                })
            ];
        });

        \Log::info('TableRowController response:', [
            'count' => $responseData->count(),
            'sample' => $responseData->first()
        ]);

        return response()->json([
            'data' => $responseData,
            'meta' => [
                'total' => $rows->count(),
                'current_page' => 1,
                'per_page' => $rows->count()
            ]
        ]);
    }
}
