<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReferralController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->referral_code) {
            $refCode = 'REF-' . strtoupper(Str::random(6));
            while (\App\Models\User::where('referral_code', $refCode)->exists()) {
                $refCode = 'REF-' . strtoupper(Str::random(6));
            }
            $user->update(['referral_code' => $refCode]);
        }

        $referrals = Referral::where('referrer_id', $user->id)
            ->with('referredUser:id,name,created_at')
            ->latest()
            ->get();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referrals' => $referrals,
            'total_earned' => $referrals->where('status', 'completed')->sum('reward_points'),
        ]);
    }
}
