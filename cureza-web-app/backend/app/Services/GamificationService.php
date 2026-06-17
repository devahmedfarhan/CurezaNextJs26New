<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Badge;
use App\Models\Referral;
use App\Models\Order;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GamificationService
{
    /**
     * Get gamification earning rules with fallbacks.
     */
    public static function getRules(): array
    {
        $settings = SystemSetting::where('group', 'gamification')->get()->keyBy('key');

        return [
            'xp_per_100_spent' => (int) ($settings->get('xp_per_100_spent')?->value ?? 10),
            'xp_per_review' => (int) ($settings->get('xp_per_review')?->value ?? 50),
            'xp_per_photo_upload' => (int) ($settings->get('xp_per_photo_upload')?->value ?? 100),
            'xp_per_referral' => (int) ($settings->get('xp_per_referral')?->value ?? 1000),
        ];
    }

    /**
     * Update gamification earning rules.
     */
    public static function updateRules(array $data): void
    {
        foreach ($data as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key, 'group' => 'gamification'],
                ['value' => $value, 'is_secret' => false]
            );
        }
    }

    /**
     * Credit or debit reward points to a user.
     */
    public static function adjustPoints(User $user, int $points, string $description, string $type = 'credit', $referenceId = null): void
    {
        if ($points <= 0) return;

        DB::transaction(function () use ($user, $points, $description, $type, $referenceId) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0.00, 'points' => 0]
            );

            if ($type === 'credit') {
                $wallet->increment('points', $points);
            } else {
                // Ensure points do not go below zero
                $currentPoints = $wallet->points;
                $pointsToDecrement = min($points, $currentPoints);
                if ($pointsToDecrement > 0) {
                    $wallet->decrement('points', $pointsToDecrement);
                }
            }

            $wallet->transactions()->create([
                'type' => $type,
                'points' => $points,
                'amount' => 0.00,
                'description' => $description,
                'reference_id' => $referenceId,
            ]);

            Log::info("Adjusted points for user {$user->id}: {$points} XP ({$type}). Reason: {$description}");

            // Verify if user unlocked any new badges
            self::checkBadges($user);
        });
    }

    /**
     * Check and unlock badges for a user.
     */
    public static function checkBadges(User $user): void
    {
        try {
            $activeBadges = Badge::where('is_active', true)->get();
            $unlockedBadgeIds = $user->badges()->pluck('badges.id')->toArray();

            $user->unsetRelation('wallet');
            $points = $user->wallet?->points ?? 0;
            
            // Cached count queries
            $completedChallengesCount = null;
            $completedOrdersCount = null;
            $completedReferralsCount = null;

            foreach ($activeBadges as $badge) {
                if (in_array($badge->id, $unlockedBadgeIds)) {
                    continue; // Already unlocked
                }

                $unlocked = false;

                switch ($badge->rule_type) {
                    case 'points_milestone':
                        $unlocked = $points >= $badge->rule_value;
                        break;

                    case 'challenges_completed':
                        if ($completedChallengesCount === null) {
                            $completedChallengesCount = $user->challengesJoined()->where('status', 'claimed')->count();
                        }
                        $unlocked = $completedChallengesCount >= $badge->rule_value;
                        break;

                    case 'purchases_made':
                        if ($completedOrdersCount === null) {
                            $completedOrdersCount = Order::where('user_id', $user->id)->where('status', 'completed')->count();
                        }
                        $unlocked = $completedOrdersCount >= $badge->rule_value;
                        break;

                    case 'referrals_made':
                        if ($completedReferralsCount === null) {
                            $completedReferralsCount = Referral::where('referrer_id', $user->id)->where('status', 'completed')->count();
                        }
                        $unlocked = $completedReferralsCount >= $badge->rule_value;
                        break;
                }

                if ($unlocked) {
                    $user->badges()->attach($badge->id, ['unlocked_at' => now()]);
                    Log::info("User {$user->id} unlocked badge: {$badge->name}");
                }
            }
        } catch (\Exception $e) {
            Log::error("Error checking badges for user {$user->id}: " . $e->getMessage());
        }
    }

    /**
     * Complete a pending referral when the referee finishes their first order.
     */
    public static function completeReferral(User $referee): void
    {
        try {
            // Find if there is a pending referral where this user is the referee
            $referral = Referral::where('referred_user_id', $referee->id)
                ->where('status', 'pending')
                ->first();

            if (!$referral) {
                return;
            }

            // Verify this is their first completed order
            $completedOrdersCount = Order::where('user_id', $referee->id)
                ->where('status', 'completed')
                ->count();

            if ($completedOrdersCount > 1) {
                return; // Not their first purchase
            }

            DB::transaction(function () use ($referral, $referee) {
                $rules = self::getRules();
                $referralPoints = $rules['xp_per_referral'];

                // Update referral status
                $referral->update([
                    'status' => 'completed',
                    'reward_points' => $referralPoints,
                ]);

                // Credit points to referrer
                $referrer = User::find($referral->referrer_id);
                if ($referrer) {
                    self::adjustPoints(
                        $referrer,
                        $referralPoints,
                        "Referral completion bonus: Referred " . $referee->name,
                        'credit',
                        $referral->id
                    );
                }

                // Credit points to referee as well
                self::adjustPoints(
                    $referee,
                    200, // Welcome discount points
                    "Referral welcome bonus",
                    'credit',
                    $referral->id
                );

                Log::info("Completed referral ID {$referral->id} between referrer {$referral->referrer_id} and referee {$referee->id}");
            });
        } catch (\Exception $e) {
            Log::error("Error completing referral for referee {$referee->id}: " . $e->getMessage());
        }
    }
}
