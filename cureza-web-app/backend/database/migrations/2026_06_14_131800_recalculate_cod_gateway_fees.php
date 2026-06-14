<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Services\CommissionService;
use App\Services\WalletService;

class RecalculateCodGatewayFees extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // 1. Get all orders where payment_method is COD and commission has been calculated
        $orders = Order::where('payment_method', 'cod')
            ->whereNotNull('commission_calculated_at')
            ->get();

        $commissionService = new CommissionService();
        $walletService = new WalletService();

        foreach ($orders as $order) {
            // Check if there was any gateway fee calculated and deducted
            if ($order->payment_gateway_fee > 0) {
                $refundAmount = (float)$order->payment_gateway_fee;

                // Update order gateway fee and seller earnings
                $order->payment_gateway_fee = 0;
                $order->seller_earnings = $order->seller_earnings + $refundAmount;
                $order->save();

                // Group items by seller to refund each seller's gateway fee
                $itemsBySeller = $order->items->groupBy('seller_id');
                foreach ($itemsBySeller as $sellerId => $items) {
                    if (!$sellerId) continue;

                    $sellerTotal = $items->sum('total');
                    $commission = $commissionService->getSellerCommissionRate($sellerId, $order->created_at);
                    
                    // Gateway fee that was deducted (payment_gateway_percentage % of seller total)
                    $deductedGatewayFee = $sellerTotal * ($commission->payment_gateway_percentage / 100);

                    if ($deductedGatewayFee > 0) {
                        // Credit the deducted gateway fee back to the seller's wallet
                        $walletService->creditEarnings(
                            $sellerId,
                            $order->id,
                            $deductedGatewayFee,
                            "Refund/Adjustment for COD gateway fee on Order #{$order->order_number}",
                            [
                                'order_total' => $sellerTotal,
                                'platform_commission' => $sellerTotal * ($commission->base_commission_percentage / 100),
                                'gateway_fee' => 0.00,
                                'commission_percentage' => $commission->base_commission_percentage,
                                'gateway_percentage' => 0.00,
                                'action' => 'cod_fee_refund'
                            ]
                        );
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No rollback needed for data correction migrations
    }
}
