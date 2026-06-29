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

        $legacy100Spent = $settings->get('xp_per_100_spent')?->value;
        $legacyReview = $settings->get('xp_per_review')?->value;
        $legacyPhoto = $settings->get('xp_per_photo_upload')?->value;
        $legacyReferral = $settings->get('xp_per_referral')?->value;

        return [
            'xp_product_purchase' => (int) ($settings->get('xp_product_purchase')?->value ?? 100),
            'points_per_100_spent' => (int) ($settings->get('points_per_100_spent')?->value ?? $legacy100Spent ?? 10),
            
            'xp_write_review' => (int) ($settings->get('xp_write_review')?->value ?? $legacyReview ?? 50),
            'points_write_review' => (int) ($settings->get('points_write_review')?->value ?? 20),
            
            'xp_ugc_upload' => (int) ($settings->get('xp_ugc_upload')?->value ?? $legacyPhoto ?? 100),
            'points_ugc_upload' => (int) ($settings->get('points_ugc_upload')?->value ?? 40),
            
            'xp_refer_friend' => (int) ($settings->get('xp_refer_friend')?->value ?? 200),
            'points_refer_friend' => (int) ($settings->get('points_refer_friend')?->value ?? $legacyReferral ?? 100),
            
            // Legacy / test specific keys
            'xp_per_100_spent' => (int) ($settings->get('xp_per_100_spent')?->value ?? $legacy100Spent ?? 10),
            'xp_per_referral' => (int) ($settings->get('xp_per_referral')?->value ?? $legacyReferral ?? 1000),
            'xp_per_review' => (int) ($settings->get('xp_per_review')?->value ?? $legacyReview ?? 50),
            'xp_per_photo_upload' => (int) ($settings->get('xp_per_photo_upload')?->value ?? $legacyPhoto ?? 100),

            'xp_upload_prescription' => (int) ($settings->get('xp_upload_prescription')?->value ?? 150),
            'points_upload_prescription' => (int) ($settings->get('points_upload_prescription')?->value ?? 0),
            
            'xp_join_event' => (int) ($settings->get('xp_join_event')?->value ?? 250),
            'points_join_event' => (int) ($settings->get('points_join_event')?->value ?? 50),
            
            'xp_daily_checkin' => (int) ($settings->get('xp_daily_checkin')?->value ?? 20),
            'points_daily_checkin' => (int) ($settings->get('points_daily_checkin')?->value ?? 0),

            'xp_instagram_review' => (int) ($settings->get('xp_instagram_review')?->value ?? 500),
            'points_instagram_review' => (int) ($settings->get('points_instagram_review')?->value ?? 250),

            'xp_youtube_review' => (int) ($settings->get('xp_youtube_review')?->value ?? 1000),
            'points_youtube_review' => (int) ($settings->get('points_youtube_review')?->value ?? 500),

            'referral_module_enabled' => filter_var($settings->get('referral_module_enabled')?->value ?? true, FILTER_VALIDATE_BOOLEAN),
            'influencer_module_enabled' => filter_var($settings->get('influencer_module_enabled')?->value ?? true, FILTER_VALIDATE_BOOLEAN),
            'challenges_module_enabled' => filter_var($settings->get('challenges_module_enabled')?->value ?? true, FILTER_VALIDATE_BOOLEAN),
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
     * Adjust both XP and points for a user.
     */
    public static function adjustXPAndPoints(User $user, int $xp, int $points, string $description, string $type = 'credit', $referenceId = null): void
    {
        if ($xp <= 0 && $points <= 0) return;

        DB::transaction(function () use ($user, $xp, $points, $description, $type, $referenceId) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0.00, 'points' => 0, 'xp' => 0]
            );

            if ($type === 'credit') {
                if ($xp > 0) {
                    $wallet->increment('xp', $xp);
                }
                if ($points > 0) {
                    $wallet->increment('points', $points);
                }
            } else {
                // Debit/Spend only affects points, not lifetime XP
                $pointsToDecrement = min($points, $wallet->points);
                if ($pointsToDecrement > 0) {
                    $wallet->decrement('points', $pointsToDecrement);
                }
            }

            $wallet->transactions()->create([
                'type' => $type,
                'points' => $points,
                'xp' => $xp,
                'amount' => 0.00,
                'description' => $description,
                'reference_id' => $referenceId,
            ]);

            Log::info("Adjusted gamification for user {$user->id}: {$xp} XP, {$points} Points ({$type}). Reason: {$description}");

            // Verify if user unlocked any new badges
            self::checkBadges($user);
        });
    }

    /**
     * Credit or debit reward points to a user (backwards compatibility wrapper).
     */
    public static function adjustPoints(User $user, int $points, string $description, string $type = 'credit', $referenceId = null): void
    {
        self::adjustXPAndPoints($user, 0, $points, $description, $type, $referenceId);
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
                $refXP = $rules['xp_refer_friend'] ?? 200;
                $refPoints = $rules['points_refer_friend'] ?? 100;

                // Update referral status
                $referral->update([
                    'status' => 'completed',
                    'reward_points' => $refPoints,
                ]);

                // Credit points/XP to referrer
                $referrer = User::find($referral->referrer_id);
                if ($referrer) {
                    self::adjustXPAndPoints(
                        $referrer,
                        $refXP,
                        $refPoints,
                        "Referral completion bonus: Referred " . $referee->name,
                        'credit',
                        $referral->id
                    );

                    // Increment active referral challenges
                    self::incrementChallengeProgress($referrer, 'referral', 1);
                }

                // Credit welcome points/XP to referee as well
                self::adjustXPAndPoints(
                    $referee,
                    100, // Welcome XP
                    200, // Welcome Points
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

    /**
     * Increment challenge progress for active user quests of a specific type.
     */
    public static function incrementChallengeProgress(User $user, string $type, int $increment = 1): void
    {
        try {
            $joinedChallenges = \App\Models\UserChallenge::where('user_id', $user->id)
                ->where('status', 'in_progress')
                ->whereHas('challenge', function ($query) use ($type) {
                    $query->where('type', $type)
                        ->where('is_active', true)
                        ->where('start_date', '<=', now())
                        ->where('end_date', '>=', now());
                })
                ->get();

            foreach ($joinedChallenges as $userChallenge) {
                $challenge = $userChallenge->challenge;
                $newValue = $userChallenge->current_value + $increment;
                
                $status = 'in_progress';
                if ($newValue >= $challenge->goal_value) {
                    $status = 'completed';
                }

                $userChallenge->update([
                    'current_value' => $newValue,
                    'status' => $status
                ]);

                Log::info("Incremented challenge progress for user {$user->id}, challenge {$challenge->id} (type: {$type}) to {$newValue}");
            }
        } catch (\Exception $e) {
            Log::error("Error incrementing challenge progress for user {$user->id}: " . $e->getMessage());
        }
    }
}
