<?php

namespace App\Http\Controllers;

use App\Models\MembershipTier;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);
        
        // Determine Tier based on XP
        $tier = MembershipTier::where('min_points', '<=', $wallet->xp)
            ->orderByDesc('min_points')
            ->first();

        if (!$tier) {
            $tier = MembershipTier::orderBy('min_points')->first(); // Default to lowest
        }

        $nextTier = MembershipTier::where('min_points', '>', $wallet->xp)
            ->orderBy('min_points')
            ->first();

        return response()->json([
            'current_tier' => $tier,
            'next_tier' => $nextTier,
            'points' => $wallet->points,
            'xp' => $wallet->xp,
            'points_needed' => $nextTier ? $nextTier->min_points - $wallet->xp : 0,
            'checkin_streak' => $wallet->checkin_streak,
            'last_checkin_at' => $wallet->last_checkin_at,
            'rules' => \App\Services\GamificationService::getRules(),
        ]);
    }

    public function publicProfile($id)
    {
        $user = User::findOrFail($id);
        // In a real app, check privacy settings here
        
        return response()->json([
            'name' => $user->name,
            'joined_at' => $user->created_at->format('F Y'),
            // Add more public stats if needed
        ]);
    }

    public function leaderboard(Request $request)
    {
        $topWallets = Wallet::orderByDesc('xp')
            ->with('user:id,name,created_at')
            ->take(15)
            ->get();

        $rank = 1;
        $leaders = $topWallets->map(function ($w) use (&$rank) {
            $user = $w->user;
            $name = $user ? $user->name : 'Unknown User';
            $nameParts = explode(' ', $name);
            $displayName = $nameParts[0];
            if (count($nameParts) > 1) {
                $displayName .= ' ' . substr($nameParts[1], 0, 1) . '.';
            }

            $tier = MembershipTier::where('min_points', '<=', $w->xp)
                ->orderByDesc('min_points')
                ->first();

            return [
                'rank' => $rank++,
                'user_id' => $user ? $user->id : null,
                'name' => $displayName,
                'xp' => $w->xp,
                'badge' => $tier ? $tier->name : 'Silver',
            ];
        });

        $userWallet = Wallet::firstOrCreate(['user_id' => $request->user()->id]);
        $currentUserRank = Wallet::where('xp', '>', $userWallet->xp)->count() + 1;

        return response()->json([
            'leaders' => $leaders,
            'user_rank' => $currentUserRank,
            'user_xp' => $userWallet->xp,
        ]);
    }

    public function badges(Request $request)
    {
        $user = $request->user();
        $allBadges = \App\Models\Badge::where('is_active', true)->get();
        $unlockedBadges = $user->badges()->get()->keyBy('id');

        $badges = $allBadges->map(function ($b) use ($unlockedBadges) {
            $unlocked = $unlockedBadges->has($b->id);
            return [
                'id' => $b->id,
                'name' => $b->name,
                'desc' => $b->description,
                'icon' => $b->icon,
                'unlocked' => $unlocked,
                'unlocked_at' => $unlocked ? $unlockedBadges->get($b->id)->pivot->unlocked_at->format('M d, Y') : null,
            ];
        });

        return response()->json($badges);
    }

    public function rewardsList(Request $request)
    {
        $rewards = \App\Models\Reward::where('is_active', true)->get();
        return response()->json($rewards);
    }

    public function redeemReward(Request $request, $id)
    {
        $user = $request->user();
        $reward = \App\Models\Reward::findOrFail($id);

        if (!$reward->is_active) {
            return response()->json(['message' => 'This reward is currently unavailable.'], 422);
        }

        if ($reward->stock === 0) {
            return response()->json(['message' => 'This reward is out of stock.'], 422);
        }

        $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);

        if ($wallet->points < $reward->points_cost) {
            return response()->json(['message' => 'Insufficient points balance.'], 422);
        }

        $shippingAddress = null;
        if ($reward->type === 'physical') {
            $request->validate([
                'shipping_address' => 'required|string',
            ]);
            $shippingAddress = $request->shipping_address;
        }

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            \App\Services\GamificationService::adjustPoints(
                $user,
                $reward->points_cost,
                "Redeemed reward: " . $reward->name,
                'debit',
                $reward->id
            );

            $couponCode = null;
            if ($reward->type === 'coupon') {
                $couponCode = $reward->coupon_code ?? ('CUR-' . strtoupper(\Illuminate\Support\Str::random(8)));
                
                \Illuminate\Support\Facades\DB::table('coupons')->insertOrIgnore([
                    'code' => $couponCode,
                    'type' => 'fixed',
                    'value' => str_contains(strtolower($reward->name), 'shipping') ? 100.00 : 500.00,
                    'min_cart_value' => 0.00,
                    'is_active' => true,
                    'expires_at' => now()->addMonths(3),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $redemption = \App\Models\RewardRedemption::create([
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'points_spent' => $reward->points_cost,
                'coupon_code' => $couponCode,
                'status' => $reward->type === 'physical' ? 'pending' : 'fulfilled',
                'shipping_address' => $shippingAddress,
            ]);

            if ($reward->stock > 0) {
                $reward->decrement('stock');
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'message' => 'Redeemed successfully!',
                'redemption' => $redemption,
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Redemption failed: ' . $e->getMessage()], 500);
        }
    }

    public function redemptionsHistory(Request $request)
    {
        $redemptions = \App\Models\RewardRedemption::where('user_id', $request->user()->id)
            ->with('reward:id,name,description,type,image_url')
            ->latest()
            ->get();

        return response()->json($redemptions);
    }

    public function dailyCheckIn(Request $request)
    {
        $user = $request->user();
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0.00, 'points' => 0, 'xp' => 0, 'checkin_streak' => 0]
        );

        $now = now();
        $lastCheckin = $wallet->last_checkin_at ? \Carbon\Carbon::parse($wallet->last_checkin_at) : null;

        if ($lastCheckin && $lastCheckin->isToday()) {
            return response()->json([
                'success' => false,
                'message' => 'You have already checked in today! Come back tomorrow.',
                'streak' => $wallet->checkin_streak,
            ], 422);
        }

        $streak = $wallet->checkin_streak;
        if ($lastCheckin && $lastCheckin->isYesterday()) {
            $streak += 1;
        } else {
            $streak = 1;
        }

        $rules = \App\Services\GamificationService::getRules();
        $checkinXP = $rules['xp_daily_checkin'] ?? 20;
        $checkinPoints = $rules['points_daily_checkin'] ?? 0;

        \App\Services\GamificationService::adjustXPAndPoints(
            $user,
            $checkinXP,
            $checkinPoints,
            "Daily check-in (Day {$streak} streak)",
            'credit'
        );

        $wallet->last_checkin_at = $now;
        $wallet->checkin_streak = $streak;
        $wallet->save();

        return response()->json([
            'success' => true,
            'message' => 'Daily check-in successful!',
            'streak' => $streak,
            'xp_earned' => $checkinXP,
            'points_earned' => $checkinPoints,
            'xp_balance' => $wallet->fresh()->xp,
            'points_balance' => $wallet->fresh()->points,
        ]);
    }

    public function claimEventAttendance(Request $request)
    {
        $request->validate([
            'event_code' => 'required|string',
            'event_title' => 'required|string',
        ]);

        $user = $request->user();
        
        $alreadyClaimed = \App\Models\WalletTransaction::where('wallet_id', function ($query) use ($user) {
                $query->select('id')->from('wallets')->where('user_id', $user->id);
            })
            ->where('reference_id', 'event_' . strtolower($request->event_code))
            ->exists();

        if ($alreadyClaimed) {
            return response()->json([
                'success' => false,
                'message' => 'You have already claimed rewards for this wellness event!'
            ], 422);
        }

        $rules = \App\Services\GamificationService::getRules();
        $eventXP = $rules['xp_join_event'] ?? 250;
        $eventPoints = $rules['points_join_event'] ?? 50;

        \App\Services\GamificationService::adjustXPAndPoints(
            $user,
            $eventXP,
            $eventPoints,
            "Joined Live Wellness Event: " . $request->event_title,
            'credit',
            'event_' . strtolower($request->event_code)
        );

        return response()->json([
            'success' => true,
            'message' => 'Event attendance verified! Rewards added to your account.',
            'xp_earned' => $eventXP,
            'points_earned' => $eventPoints,
        ]);
    }
}
