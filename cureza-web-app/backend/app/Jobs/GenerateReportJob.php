<?php

namespace App\Jobs;

use App\Models\Report;
use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class GenerateReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $report;

    /**
     * Create a new job instance.
     */
    public function __construct(Report $report)
    {
        $this->report = $report;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $this->report->update(['status' => 'processing']);

            $params = $this->report->parameters;
            $type = $this->report->type;
            $startDate = $params['start_date'] ?? Carbon::now()->subDays(30);
            $endDate = $params['end_date'] ?? Carbon::now();

            $csvContent = "";

            if ($type === 'orders') {
                $data = Order::with('user')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->latest()
                    ->get();

                // CSV Header
                $csvContent .= "ID,Order Number,Final Amount,Payment Method,Order Status,Payment Status,Created At,Customer Name\n";
                foreach ($data as $ord) {
                    $customerName = $ord->user ? $ord->user->name : 'Guest';
                    $csvContent .= "{$ord->id},\"{$ord->order_number}\",{$ord->final_amount},\"{$ord->payment_method}\",\"{$ord->status}\",\"{$ord->payment_status}\",\"{$ord->created_at}\",\"{$customerName}\"\n";
                }
            } elseif ($type === 'users') {
                $data = User::whereBetween('created_at', [$startDate, $endDate])
                    ->latest()
                    ->get();

                // CSV Header
                $csvContent .= "ID,Name,Email,Role,Created At\n";
                foreach ($data as $usr) {
                    $csvContent .= "{$usr->id},\"{$usr->name}\",\"{$usr->email}\",\"{$usr->role}\",\"{$usr->created_at}\"\n";
                }
            } else {
                throw new \Exception("Unsupported report type: {$type}");
            }

            // Save report file
            $filename = "reports/report_" . $this->report->id . "_" . time() . ".csv";
            Storage::disk('public')->put($filename, $csvContent);

            $fileUrl = Storage::disk('public')->url($filename);

            $this->report->update([
                'status' => 'completed',
                'file_path' => $fileUrl
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to generate report {$this->report->id}: " . $e->getMessage());
            $this->report->update([
                'status' => 'failed',
                'error' => $e->getMessage()
            ]);
        }
    }
}
