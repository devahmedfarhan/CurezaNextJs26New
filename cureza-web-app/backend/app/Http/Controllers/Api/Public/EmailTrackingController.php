<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EmailLog;
use App\Models\Campaign;
use Illuminate\Support\Facades\Log;

class EmailTrackingController extends Controller
{
    /**
     * Track email opens via transparent 1x1 pixel image request.
     */
    public function trackOpen($id)
    {
        try {
            $log = EmailLog::find($id);
            if ($log) {
                // If status is queued or sent, update to delivered (meaning recipient opened/downloaded images)
                if (in_array($log->status, ['queued', 'sent'])) {
                    $log->update(['status' => 'delivered']);
                }

                // If this email belongs to a campaign, increment the campaign's open count
                if (!empty($log->template_key)) {
                    $campaign = Campaign::where('template', $log->template_key)
                        ->where('status', 'sending')
                        ->orWhere('status', 'sent')
                        ->latest()
                        ->first();
                        
                    if ($campaign) {
                        $campaign->increment('total_opened');
                        
                        // Recalculate open rate percentage
                        if ($campaign->recipients > 0) {
                            $openRate = round(($campaign->total_opened / $campaign->recipients) * 100);
                            $campaign->update(['open_rate' => $openRate]);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("EmailTrackingController open tracking failed for Log ID {$id}: " . $e->getMessage());
        }

        // Return a transparent 1x1 pixel PNG
        $pixel = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
        return response($pixel, 200, [
            'Content-Type' => 'image/png',
            'Content-Length' => strlen($pixel),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Track outbound URL clicks in marketing campaigns.
     */
    public function trackClick(Request $request)
    {
        $logId = $request->query('log_id');
        $targetUrl = $request->query('url');

        if (empty($targetUrl)) {
            return response()->json(['message' => 'Target URL is missing.'], 400);
        }

        try {
            if ($logId) {
                $log = EmailLog::find($logId);
                if ($log && !empty($log->template_key)) {
                    $campaign = Campaign::where('template', $log->template_key)
                        ->where('status', 'sending')
                        ->orWhere('status', 'sent')
                        ->latest()
                        ->first();

                    if ($campaign) {
                        $campaign->increment('total_clicked');
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("EmailTrackingController click tracking failed for Log ID {$logId}: " . $e->getMessage());
        }

        // Redirect to target URL
        return redirect()->away($targetUrl);
    }
}
