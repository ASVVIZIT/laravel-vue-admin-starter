<?php

namespace App\Http\Controllers\Api\ElectricalProtection;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\Cable;
use Illuminate\Http\Request;

class CableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Cable::with(['brand:id,name,website'])
            ->orderBy('cross_section');

        // Фильтр по сечению
        if ($request->has('cross_section')) {
            $query->where('cross_section', $request->cross_section);
        }

        $cables = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $cables->map(function ($cable) {
                return [
                    'id' => $cable->id,
                    'type' => $cable->type,
                    'specifications' => [
                        'cross_section' => $cable->cross_section . ' мм²',
                        'cores' => $cable->cores,
                        'current_rating' => $cable->current_rating . 'A',
                        'insulation' => $cable->insulation,
                        'standards' => 'ГОСТ 31996-2012'
                    ],
                    'brand' => $cable->brand,
                    'temperature_range' => $cable->temperature_range
                ];
            }),
            'meta' => $this->getPaginationMeta($cables)
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
