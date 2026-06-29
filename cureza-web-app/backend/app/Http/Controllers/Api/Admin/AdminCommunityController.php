<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Referral;
use App\Models\WalletTransaction;
use App\Models\RewardRedemption;
use App\Services\GamificationService;
use Illuminate\Http\Request;

class AdminCommunityController extends Controller
{
    public function stats()
    {
        $totalMembers = User::where('role', 'customer')->count();
        $totalReferrals = Referral::count();
        $completedReferrals = Referral::where('status', 'completed')->count();
        
        $totalXPDistributed = WalletTransaction::where('xp', '>', 0)
            ->where('type', 'credit')
            ->sum('xp');
            
        $totalRedemptions = RewardRedemption::count();

        return response()->json([
            'total_members' => $totalMembers,
            'total_referrals' => $totalReferrals,
            'completed_referrals' => $completedReferrals,
            'total_xp_distributed' => $totalXPDistributed,
            'total_redemptions' => $totalRedemptions,
        ]);
    }

    public function getSettings()
    {
        return response()->json(GamificationService::getRules());
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'xp_product_purchase' => 'sometimes|required|integer|min:0',
            'points_per_100_spent' => 'sometimes|required|integer|min:0',
            'xp_write_review' => 'sometimes|required|integer|min:0',
            'points_write_review' => 'sometimes|required|integer|min:0',
            'xp_ugc_upload' => 'sometimes|required|integer|min:0',
            'points_ugc_upload' => 'sometimes|required|integer|min:0',
            'xp_refer_friend' => 'sometimes|required|integer|min:0',
            'points_refer_friend' => 'sometimes|required|integer|min:0',
            'xp_upload_prescription' => 'sometimes|required|integer|min:0',
            'points_upload_prescription' => 'sometimes|required|integer|min:0',
            'xp_join_event' => 'sometimes|required|integer|min:0',
            'points_join_event' => 'sometimes|required|integer|min:0',
            'xp_daily_checkin' => 'sometimes|required|integer|min:0',
            'points_daily_checkin' => 'sometimes|required|integer|min:0',
            'xp_instagram_review' => 'sometimes|required|integer|min:0',
            'points_instagram_review' => 'sometimes|required|integer|min:0',
            'xp_youtube_review' => 'sometimes|required|integer|min:0',
            'points_youtube_review' => 'sometimes|required|integer|min:0',
            'xp_per_100_spent' => 'sometimes|required|integer|min:0',
            'xp_per_review' => 'sometimes|required|integer|min:0',
            'xp_per_photo_upload' => 'sometimes|required|integer|min:0',
            'xp_per_referral' => 'sometimes|required|integer|min:0',
            'referral_module_enabled' => 'nullable|boolean',
            'influencer_module_enabled' => 'nullable|boolean',
            'challenges_module_enabled' => 'nullable|boolean',
        ]);

        GamificationService::updateRules($validated);

        return response()->json([
            'message' => 'Earning rules updated successfully!',
            'rules' => GamificationService::getRules()
        ]);
    }

    public function activityLog(Request $request)
    {
        $query = WalletTransaction::with('wallet.user:id,name,email')
            ->where('points', '>', 0)
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('wallet.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $activities = $query->paginate(20);

        return response()->json($activities);
    }
}
