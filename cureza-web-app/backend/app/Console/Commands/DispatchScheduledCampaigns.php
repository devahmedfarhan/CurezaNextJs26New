<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Campaign;
use App\Jobs\SendCampaignJob;
use Carbon\Carbon;

class DispatchScheduledCampaigns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaigns:dispatch-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatches scheduled campaigns whose scheduled time has arrived';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for scheduled campaigns...');

        $campaigns = Campaign::where('status', 'scheduled')
            ->where('scheduled_at', '<=', Carbon::now())
            ->get();

        if ($campaigns->isEmpty()) {
            $this->info('No scheduled campaigns to dispatch.');
            return;
        }

        foreach ($campaigns as $campaign) {
            $this->info("Dispatching campaign: {$campaign->title} (ID: {$campaign->id})");
            
            $campaign->update(['status' => 'queued']);
            SendCampaignJob::dispatch($campaign);
            
            $this->info("Successfully queued campaign {$campaign->id}.");
        }
    }
}
