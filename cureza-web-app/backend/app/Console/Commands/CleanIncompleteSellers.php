<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\SellerProfile;
use App\Models\Brand;
use App\Notifications\IncompleteSellerRegistrationWarning;

class CleanIncompleteSellers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seller:clean-incomplete';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send warnings to incomplete seller profiles after 2 days and delete them after 3 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting incomplete seller profile clean/warning task...");

        // 1. Process warnings (Incomplete for 2+ days, not yet warned)
        $warnThreshold = now()->subDays(2);
        $toWarn = SellerProfile::where('status', 'incomplete')
            ->where('created_at', '<=', $warnThreshold)
            ->whereNull('warned_at')
            ->get();

        $this->info("Found " . $toWarn->count() . " profiles to warn.");
        foreach ($toWarn as $profile) {
            $user = $profile->user;
            if ($user) {
                try {
                    $user->notify(new IncompleteSellerRegistrationWarning($profile));
                    $this->info("Sent onboarding warning notification to: " . $user->email);
                } catch (\Exception $e) {
                    $this->error("Failed to notify user " . $user->email . ": " . $e->getMessage());
                }
            }
            $profile->update(['warned_at' => now()]);
        }

        // 2. Process deletions (Incomplete for 3+ days)
        $deleteThreshold = now()->subDays(3);
        $toDelete = SellerProfile::where('status', 'incomplete')
            ->where('created_at', '<=', $deleteThreshold)
            ->get();

        $this->info("Found " . $toDelete->count() . " profiles to delete.");
        foreach ($toDelete as $profile) {
            $userId = $profile->user_id;
            $user = $profile->user;
            $email = $user ? $user->email : 'unknown';

            $this->info("Deleting incomplete seller profile for user: " . $email . " (User ID: " . $userId . ")");

            try {
                // Delete Brand (Strict 1:1 Enforcement)
                Brand::where('user_id', $userId)->delete();
                // Delete Profile
                $profile->delete();
                // Delete User
                User::where('id', $userId)->delete();
                
                $this->info("Deleted user and brand successfully.");
            } catch (\Exception $e) {
                $this->error("Failed to delete user ID " . $userId . ": " . $e->getMessage());
            }
        }

        $this->info("Clean/warning task complete.");
        return 0;
    }
}
