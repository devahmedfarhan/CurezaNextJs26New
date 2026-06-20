<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SellerCommission;
use App\Models\SellerWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Get seller's active commission rate
     * 
     * @param int $sellerId
     * @param string|null $date
     * @return SellerCommission|null
     */
    public function getSellerCommissionRate($sellerId, $date = null)
    {
        $date = $date ?? now();
        
        $commission = SellerCommission::where('seller_id', $sellerId)
            ->where('is_active', true)
            ->where('valid_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>=', $date);
            })
            ->orderBy('valid_from', 'desc')
            ->first();

        // If no commission found, return default (25% platform + 2.5% gateway = 27.5% total)
        if (!$commission) {
            return $this->getDefaultCommission($sellerId);
        }

        return $commission;
    }

    /**
     * Get default commission for seller
     */
    private function getDefaultCommission($sellerId)
    {
        // Create default commission if not exists
        return SellerCommission::firstOrCreate(
            [
                'seller_id' => $sellerId,
                'is_active' => true,
                'valid_from' => now()->startOfDay(),
            ],
            [
                'base_commission_percentage' => 25.00,
                'payment_gateway_percentage' => 2.50,
                'effective_commission_percentage' => 27.50,
                'notes' => 'Default commission rate',
            ]
        );
    }

    /**
     * Calculate commission for an order
     * Returns breakdown of commission components
     * 
     * @param Order $order
     * @return array
     */
    public function calculateOrderCommission(Order $order)
    {
        $breakdown = [];
        $totalPlatformCommission = 0;
        $totalGatewayFee = 0;
        $totalSellerEarnings = 0;

        // Group order items by seller
        $itemsBySeller = $order->items->groupBy('seller_id');

        foreach ($itemsBySeller as $sellerId => $items) {
            if (!$sellerId) continue; // Skip if no seller

            $sellerTotal = $items->sum('total');
            $commission = $this->getSellerCommissionRate($sellerId, $order->created_at);

            // Get shipping charge for this seller's shipment
            $shipment = \App\Models\Shipment::where('order_id', $order->id)
                ->where('seller_id', $sellerId)
                ->first();
            $shippingCharge = $shipment ? (float)$shipment->shipping_charge : 0.00;

            $platformCommission = $sellerTotal * ($commission->base_commission_percentage / 100);
            $isCOD = strtolower($order->payment_method ?? '') === 'cod';
            $gatewayFee = $isCOD ? 0 : ($sellerTotal * ($commission->payment_gateway_percentage / 100));
            $sellerEarnings = $sellerTotal - $platformCommission - $gatewayFee - $shippingCharge;

            $breakdown[$sellerId] = [
                'seller_id' => $sellerId,
                'order_total' => round($sellerTotal, 2),
                'platform_commission_percentage' => $commission->base_commission_percentage,
                'payment_gateway_percentage' => $isCOD ? 0 : $commission->payment_gateway_percentage,
                'platform_commission_amount' => round($platformCommission, 2),
                'payment_gateway_fee' => round($gatewayFee, 2),
                'shipping_charge' => round($shippingCharge, 2),
                'total_deduction' => round($platformCommission + $gatewayFee + $shippingCharge, 2),
                'seller_earnings' => round($sellerEarnings, 2),
            ];

            $totalPlatformCommission += $platformCommission;
            $totalGatewayFee += $gatewayFee;
            $totalSellerEarnings += $sellerEarnings;
        }

        return [
            'breakdown' => $breakdown,
            'totals' => [
                'platform_commission' => round($totalPlatformCommission, 2),
                'gateway_fee' => round($totalGatewayFee, 2),
                'seller_earnings' => round($totalSellerEarnings, 2),
            ]
        ];
    }

    /**
     * Process commission when order is delivered
     * This is the SINGLE SOURCE OF TRUTH for commission calculation
     * 
     * @param Order $order
     * @return bool
     */
    public function processOrderCommission(Order $order)
    {
        // Only process if order is delivered and commission not yet calculated
        if ($order->status !== 'delivered' || $order->commission_calculated_at) {
            return false;
        }

        DB::beginTransaction();
        try {
            $commissionData = $this->calculateOrderCommission($order);

            // Update order with commission totals
            $order->update([
                'platform_commission_amount' => $commissionData['totals']['platform_commission'],
                'payment_gateway_fee' => $commissionData['totals']['gateway_fee'],
                'seller_earnings' => $commissionData['totals']['seller_earnings'],
                'commission_calculated_at' => now(),
            ]);

            // Credit each seller's wallet
            $walletService = new WalletService();
            
            foreach ($commissionData['breakdown'] as $sellerId => $data) {
                // Update payout status on shipment
                $shipment = \App\Models\Shipment::where('order_id', $order->id)
                    ->where('seller_id', $sellerId)
                    ->first();
                
                $payoutTxnId = null;
                if ($shipment) {
                    $payoutTxnId = 'TXN-' . strtoupper(\Illuminate\Support\Str::random(12));
                    $shipment->payout_status = 'paid';
                    $shipment->payout_amount = $data['seller_earnings'];
                    $shipment->payout_transaction_id = $payoutTxnId;
                    $shipment->save();
                }

                $walletService->creditEarnings(
                    $sellerId,
                    $order->id,
                    $data['seller_earnings'],
                    "Earnings from Order #{$order->order_number} (Deducted platform fee & shipping)",
                    [
                        'order_total' => $data['order_total'],
                        'platform_commission' => $data['platform_commission_amount'],
                        'gateway_fee' => $data['payment_gateway_fee'],
                        'shipping_charge' => $data['shipping_charge'],
                        'commission_percentage' => $data['platform_commission_percentage'],
                        'gateway_percentage' => $data['payment_gateway_percentage'],
                        'payout_transaction_id' => $payoutTxnId
                    ]
                );
            }

            DB::commit();
            Log::info("Commission processed for order #{$order->order_number}");
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to process commission for order #{$order->order_number}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle refund - reverse commission
     * 
     * @param Order $order
     * @return bool
     */
    public function handleRefund(Order $order)
    {
        // Only process if commission was previously calculated
        if (!$order->commission_calculated_at) {
            return false;
        }

        DB::beginTransaction();
        try {
            $walletService = new WalletService();
            
            // Get seller earnings breakdown from order items
            $itemsBySeller = $order->items->groupBy('seller_id');

            foreach ($itemsBySeller as $sellerId => $items) {
                if (!$sellerId) continue;

                $sellerTotal = $items->sum('total');
                $commission = $this->getSellerCommissionRate($sellerId, $order->created_at);

                $platformCommission = $sellerTotal * ($commission->base_commission_percentage / 100);
                $isCOD = strtolower($order->payment_method ?? '') === 'cod';
                $gatewayFee = $isCOD ? 0 : ($sellerTotal * ($commission->payment_gateway_percentage / 100));
                $sellerEarnings = $sellerTotal - $platformCommission - $gatewayFee;

                // Reverse the earnings
                $walletService->debitAmount(
                    $sellerId,
                    $order->id,
                    $sellerEarnings,
                    "Refund reversal for Order #{$order->order_number}",
                    'refund'
                );
            }

            // Clear commission calculation
            $order->update([
                'commission_calculated_at' => null,
            ]);

            DB::commit();
            Log::info("Refund processed for order #{$order->order_number}");
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to process refund for order #{$order->order_number}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get seller's commission summary
     * 
     * @param int $sellerId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getSellerCommissionSummary($sellerId, $startDate = null, $endDate = null)
    {
        $query = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->where('status', 'delivered')
        ->whereNotNull('commission_calculated_at');

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $orders = $query->get();

        $totalSales = 0;
        $totalPlatformCommission = 0;
        $totalGatewayFee = 0;
        $totalEarnings = 0;

        foreach ($orders as $order) {
            $sellerItems = $order->items->where('seller_id', $sellerId);
            $sellerTotal = $sellerItems->sum('total');
            
            $commission = $this->getSellerCommissionRate($sellerId, $order->created_at);
            $platformCommission = $sellerTotal * ($commission->base_commission_percentage / 100);
            $isCOD = strtolower($order->payment_method ?? '') === 'cod';
            $gatewayFee = $isCOD ? 0 : ($sellerTotal * ($commission->payment_gateway_percentage / 100));
            $earnings = $sellerTotal - $platformCommission - $gatewayFee;

            $totalSales += $sellerTotal;
            $totalPlatformCommission += $platformCommission;
            $totalGatewayFee += $gatewayFee;
            $totalEarnings += $earnings;
        }

        $currentCommission = $this->getSellerCommissionRate($sellerId);

        return [
            'total_sales' => round($totalSales, 2),
            'total_platform_commission' => round($totalPlatformCommission, 2),
            'total_gateway_fee' => round($totalGatewayFee, 2),
            'total_earnings' => round($totalEarnings, 2),
            'current_commission_rate' => [
                'platform' => $currentCommission->base_commission_percentage,
                'gateway' => $currentCommission->payment_gateway_percentage,
                'total' => $currentCommission->effective_commission_percentage,
            ],
            'order_count' => $orders->count(),
        ];
    }
}
