<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Report;
use App\Jobs\GenerateReportJob;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * List previously generated reports.
     */
    public function index()
    {
        return response()->json(Report::latest()->take(20)->get());
    }

    /**
     * Queue and generate a report.
     */
    public function generate(Request $request)
    {
        $type = $request->input('type', 'orders');
        $startDate = $request->input('start_date', Carbon::now()->subDays(30));
        $endDate = $request->input('end_date', Carbon::now());

        $name = ucfirst($type) . " Report (" . Carbon::parse($startDate)->format('M d') . " - " . Carbon::parse($endDate)->format('M d') . ")";

        $report = Report::create([
            'name' => $name,
            'type' => $type,
            'format' => 'CSV',
            'status' => 'pending',
            'parameters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'generated_by' => 'Super Admin'
        ]);

        // Dispatch the background queue job
        GenerateReportJob::dispatch($report);

        return response()->json([
            'message' => 'Report generation queued successfully.',
            'report' => $report
        ], 202);
    }

    /**
     * Show status of a specific report.
     */
    public function show($id)
    {
        $report = Report::findOrFail($id);
        return response()->json($report);
    }
}
