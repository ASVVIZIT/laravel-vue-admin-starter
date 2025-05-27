<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RCD;
use Illuminate\Http\Request;

class RCDController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RCD::with(['brand:id,name,website']);

        // Фильтры
        $filters = $request->only([
            'type',
            'rated_diff_current',
            'nominal_current'
        ]);

        foreach ($filters as $field => $value) {
            $query->where($field, $value);
        }

        $rcds = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $rcds->map(function ($rcd) {
                return [
                    'id' => $rcd->id,
                    'model' => $rcd->model,
                    'characteristics' => [
                        'type' => $rcd->type,
                        'rated_current' => $rcd->nominal_current . 'A',
                        'diff_current' => $rcd->rated_diff_current,
                        'breaking_capacity' => $rcd->breaking_capacity
                    ],
                    'brand' => $rcd->brand,
                    'poles' => $rcd->poles
                ];
            }),
            'meta' => $this->getPaginationMeta($rcds)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
