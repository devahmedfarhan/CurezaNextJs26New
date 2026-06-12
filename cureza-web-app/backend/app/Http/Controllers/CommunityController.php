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
}
