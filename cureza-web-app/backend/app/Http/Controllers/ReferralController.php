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
        
        // Ensure user has a referral code (stored in referrals table or user table? 
        // Let's assume user table has 'referral_code' or we generate one on the fly if not exists)
        // For simplicity, let's say we store the user's OWN code in the users table or generate it here.
        // But the prompt implies "Referral" table tracks *referrals made*.
        
        // Let's check if user has a code assigned (we might need to add this to users table, or just hash their ID)
        $myReferralCode = strtoupper(substr($user->name, 0, 3) . $user->id . Str::random(3)); 

        $referrals = Referral::where('referrer_id', $user->id)
            ->with('referredUser:id,name,created_at')
            ->get();

        return response()->json([
            'referral_code' => $myReferralCode,
            'referrals' => $referrals,
            'total_earned' => $referrals->sum('reward_points'),
        ]);
    }
}
