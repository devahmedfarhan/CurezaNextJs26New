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
        
        $totalXPDistributed = WalletTransaction::where('points', '>', 0)
            ->where('type', 'credit')
            ->sum('points');
            
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
            'xp_per_100_spent' => 'required|integer|min:0',
            'xp_per_review' => 'required|integer|min:0',
            'xp_per_photo_upload' => 'required|integer|min:0',
            'xp_per_referral' => 'required|integer|min:0',
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
