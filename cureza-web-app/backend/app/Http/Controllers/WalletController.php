<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'points' => 0]
        );

        $transactions = $wallet->transactions()->latest()->take(10)->get();

        return response()->json([
            'balance' => $wallet->balance,
            'points' => $wallet->points,
            'transactions' => $transactions
        ]);
    }
}
