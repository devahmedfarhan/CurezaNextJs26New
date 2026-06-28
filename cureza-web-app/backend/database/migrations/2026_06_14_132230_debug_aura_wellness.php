<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\User;
use App\Models\Order;
use App\Models\SellerWallet;
use App\Models\SellerTransaction;
use App\Models\Payout;
use Illuminate\Support\Facades\DB;

class DebugAuraWellness extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $user = User::where('email', 'aurawellness@cureza-seller.com')->first();
        if (!$user) {
            file_put_contents(base_path('seller_debug.json'), json_encode(['error' => 'User not found'], JSON_PRETTY_PRINT));
            return;
        }

        $sellerId = $user->id;
        $wallet = SellerWallet::where('seller_id', $sellerId)->first();
        $transactions = SellerTransaction::where('seller_id', $sellerId)->orderBy('id', 'asc')->get();
        $payouts = Payout::where('user_id', $sellerId)->get();

        // Get orders for this seller
        $orders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->with(['items' => function($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        }])->get();

        $dump = [
            'seller' => [
                'id' => $sellerId,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'wallet' => $wallet ? [
                'total_earnings' => $wallet->total_earnings,
                'available_balance' => $wallet->available_balance,
                'pending_amount' => $wallet->pending_amount,
                'paid_amount' => $wallet->paid_amount,
                'on_hold_amount' => $wallet->on_hold_amount,
            ] : null,
            'transactions' => $transactions->map(function($t) {
                return [
                    'id' => $t->id,
                    'order_id' => $t->order_id,
                    'payout_id' => $t->payout_id,
                    'type' => $t->type,
                    'amount' => $t->amount,
                    'balance_before' => $t->balance_before,
                    'balance_after' => $t->balance_after,
                    'description' => $t->description,
                    'metadata' => $t->metadata,
                ];
            }),
            'payouts' => $payouts->map(function($p) {
                return [
                    'id' => $p->id,
                    'requested_amount' => $p->requested_amount,
                    'approved_amount' => $p->approved_amount,
                    'status' => $p->status,
                ];
            }),
            'orders' => $orders->map(function($o) {
                return [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'payment_method' => $o->payment_method,
                    'payment_gateway_fee' => $o->payment_gateway_fee,
                    'seller_earnings' => $o->seller_earnings,
                    'commission_calculated_at' => $o->commission_calculated_at,
                    'items' => $o->items->map(function($i) {
                        return [
                            'product_name' => $i->product_name,
                            'price' => $i->price,
                            'quantity' => $i->quantity,
                            'total' => $i->total,
                        ];
                    }),
                ];
            }),
        ];

        file_put_contents(base_path('seller_debug.json'), json_encode($dump, JSON_PRETTY_PRINT));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
