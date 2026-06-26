<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Campaign;
use App\Jobs\SendCampaignJob;
use Carbon\Carbon;

class CampaignController extends Controller
{
    /**
     * Display a listing of the campaigns, seeding defaults if empty.
     */
    public function index()
    {
        $this->seedDefaults();
        return response()->json(Campaign::latest()->get());
    }

    /**
     * Create a new campaign and queue it for sending.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'segment' => 'required|string|max:255',
            'template' => 'required|string|max:255',
        ]);

        $campaign = Campaign::create([
            'title' => $validated['title'],
            'subject' => $validated['subject'],
            'segment' => $validated['segment'],
            'template' => $validated['template'],
            'status' => 'queued',
            'recipients' => 0,
            'delivered' => 0,
            'open_rate' => 0,
        ]);

        // Dispatch background queue job
        SendCampaignJob::dispatch($campaign);

        return response()->json($campaign, 201);
    }

    /**
     * Seed initial campaign data if empty.
     */
    private function seedDefaults()
    {
        if (Campaign::count() === 0) {
            Campaign::create([
                'title' => 'November Wellness Newsletter',
                'subject' => 'Your guide to winter wellness ❄️',
                'segment' => 'All Customers',
                'template' => 'Weekly Newsletter',
                'status' => 'sent',
                'recipients' => 12500,
                'delivered' => 100,
                'open_rate' => 24,
                'sent_at' => Carbon::now()->subDays(30)
            ]);

            Campaign::create([
                'title' => 'Supplements Flash Sale',
                'subject' => 'Flat 20% off on premium proteins!',
                'segment' => 'Inactive Users',
                'template' => 'Flash Sale Alert',
                'status' => 'sent',
                'recipients' => 4200,
                'delivered' => 100,
                'open_rate' => 31,
                'sent_at' => Carbon::now()->subDays(20)
            ]);

            Campaign::create([
                'title' => 'Herbals Product Launch',
                'subject' => 'Introducing Cureza Organic Tea Blend 🌿',
                'segment' => 'Repeat Buyers',
                'template' => 'Product Launch',
                'status' => 'sent',
                'recipients' => 8400,
                'delivered' => 100,
                'open_rate' => 28,
                'sent_at' => Carbon::now()->subDays(10)
            ]);
        }
    }
}
