<?php

namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Services\Training\TrainingCsvExportService;
use Illuminate\Http\Request;

class TrainingExportController extends Controller
{
    public function __construct(private TrainingCsvExportService $exportService) {}

    public function exportCsv(Request $request)
    {
        $filters = $request->validate([
            'tab' => 'nullable|string|in:mine,shared-with-me,shared-by-me',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'exercise_id' => 'nullable|integer',
        ]);

        return $this->exportService->export($filters);
    }
}
