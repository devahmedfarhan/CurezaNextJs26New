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
        
        // Determine Tier based on points
        $tier = MembershipTier::where('min_points', '<=', $wallet->points)
            ->orderByDesc('min_points')
            ->first();

        if (!$tier) {
            $tier = MembershipTier::orderBy('min_points')->first(); // Default to lowest
        }

        $nextTier = MembershipTier::where('min_points', '>', $wallet->points)
            ->orderBy('min_points')
            ->first();

        return response()->json([
            'current_tier' => $tier,
            'next_tier' => $nextTier,
            'points' => $wallet->points,
            'points_needed' => $nextTier ? $nextTier->min_points - $wallet->points : 0,
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
        $topWallets = Wallet::orderByDesc('points')
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

            $tier = MembershipTier::where('min_points', '<=', $w->points)
                ->orderByDesc('min_points')
                ->first();

            return [
                'rank' => $rank++,
                'user_id' => $user ? $user->id : null,
                'name' => $displayName,
                'xp' => $w->points,
                'badge' => $tier ? $tier->name : 'Silver',
            ];
        });

        $userWallet = Wallet::firstOrCreate(['user_id' => $request->user()->id]);
        $currentUserRank = Wallet::where('points', '>', $userWallet->points)->count() + 1;

        return response()->json([
            'leaders' => $leaders,
            'user_rank' => $currentUserRank,
            'user_xp' => $userWallet->points,
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
}
