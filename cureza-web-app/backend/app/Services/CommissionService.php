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
        $totalTcs = 0;
        $totalTds = 0;
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

            // Fetch seller profile to get TCS/TDS rates
            $sellerUser = \App\Models\User::find($sellerId);
            $sellerProfile = $sellerUser ? $sellerUser->sellerProfile : null;
            $tcsRate = (float)($sellerProfile->tcs_rate ?? 1.00);
            $tdsRate = (float)($sellerProfile->tds_rate ?? 1.00);

            // Compute TCS and TDS at item level and sum
            $tcsAmount = 0.00;
            $tdsAmount = 0.00;
            foreach ($items as $item) {
                $itemBasePrice = (float)($item->base_price ?? $item->total);
                $itemNetAmount = (float)($item->net_amount ?? $item->total);
                $tcsAmount += $itemBasePrice * ($tcsRate / 100);
                $tdsAmount += $itemNetAmount * ($tdsRate / 100);
            }

            $platformCommission = $sellerTotal * ($commission->base_commission_percentage / 100);
            $platformGstRate = config('platform.gst_rate', 18.00) / 100;
            $platformCommissionGst = $platformCommission * $platformGstRate;
            $isPrepaid = !in_array(strtolower($order->payment_method ?? ''), ['cod']);
            $gatewayFee = $isPrepaid ? ($sellerTotal * ($commission->payment_gateway_percentage / 100)) : 0;
            
            // Settlement Formula: net amount - commission - GST on commission - gateway fee - shipping - TCS - TDS
            $sellerEarnings = $sellerTotal - $platformCommission - $platformCommissionGst - $gatewayFee - $shippingCharge - $tcsAmount - $tdsAmount;

            $breakdown[$sellerId] = [
                'seller_id' => $sellerId,
                'order_total' => round($sellerTotal, 2),
                'platform_commission_percentage' => $commission->base_commission_percentage,
                'payment_gateway_percentage' => $isPrepaid ? $commission->payment_gateway_percentage : 0,
                'platform_commission_amount' => round($platformCommission, 2),
                'platform_commission_gst' => round($platformCommissionGst, 2),
                'payment_gateway_fee' => round($gatewayFee, 2),
                'shipping_charge' => round($shippingCharge, 2),
                'tcs_amount' => round($tcsAmount, 2),
                'tds_amount' => round($tdsAmount, 2),
                'total_deduction' => round($platformCommission + $platformCommissionGst + $gatewayFee + $shippingCharge + $tcsAmount + $tdsAmount, 2),
                'seller_earnings' => round($sellerEarnings, 2),
            ];

            $totalPlatformCommission += $platformCommission;
            $totalPlatformCommissionGst = ($totalPlatformCommissionGst ?? 0) + $platformCommissionGst;
            $totalGatewayFee += $gatewayFee;
            $totalTcs += $tcsAmount;
            $totalTds += $tdsAmount;
            $totalSellerEarnings += $sellerEarnings;
        }

        return [
            'breakdown' => $breakdown,
            'totals' => [
                'platform_commission' => round($totalPlatformCommission, 2),
                'platform_commission_gst' => round($totalPlatformCommissionGst ?? 0, 2),
                'gateway_fee' => round($totalGatewayFee, 2),
                'tcs_deduction' => round($totalTcs, 2),
                'tds_deduction' => round($totalTds, 2),
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
        $isCOD = strtolower($order->payment_method ?? '') === 'cod';
        $expectedStatus = $isCOD ? 'cod_reconciled' : 'delivered';

        if ($order->status !== $expectedStatus || $order->commission_calculated_at) {
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

                $isCOD = strtolower($order->payment_method ?? '') === 'cod';
                $reconciliationStatus = ($isCOD && $order->status !== 'cod_reconciled') ? 'pending' : 'reconciled';

                $walletService->creditEarnings(
                    $sellerId,
                    $order->id,
                    $data['seller_earnings'],
                    "Earnings from Order #{$order->order_number} (Deducted platform fee & shipping)",
                    [
                        'order_total' => $data['order_total'],
                        'platform_commission' => $data['platform_commission_amount'],
                        'platform_commission_gst' => $data['platform_commission_gst'],
                        'gateway_fee' => $data['payment_gateway_fee'],
                        'shipping_charge' => $data['shipping_charge'],
                        'commission_percentage' => $data['platform_commission_percentage'],
                        'gateway_percentage' => $data['payment_gateway_percentage'],
                        'payout_transaction_id' => $payoutTxnId
                    ],
                    $data['tcs_amount'],
                    $data['tds_amount'],
                    $reconciliationStatus
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

                // Find original credit transaction to get exact amount and metadata
                $originalTx = \App\Models\SellerTransaction::where('seller_id', $sellerId)
                    ->where('order_id', $order->id)
                    ->where('type', \App\Models\SellerTransaction::TYPE_EARNING)
                    ->first();

                $refundAmount = $originalTx ? (float)$originalTx->amount : 0.00;
                $metadata = $originalTx ? ($originalTx->metadata ?? []) : [];
                $tcsDeduction = $originalTx ? (float)$originalTx->tcs_deduction : 0.00;
                $tdsDeduction = $originalTx ? (float)$originalTx->tds_deduction : 0.00;

                if ($originalTx) {
                    // Update original transaction to mark it as refunded, avoiding any future escrow release
                    $origMeta = $originalTx->metadata ?? [];
                    $origMeta['escrow_status'] = 'refunded';
                    $origMeta['refunded_at'] = now()->toDateTimeString();
                    $originalTx->metadata = $origMeta;
                    $originalTx->save();
                }

                if ($refundAmount > 0) {
                    $walletService->debitAmount(
                        $sellerId,
                        $order->id,
                        $refundAmount,
                        "Refund reversal for Order #{$order->order_number}",
                        'refund',
                        null,
                        $metadata,
                        $tcsDeduction,
                        $tdsDeduction
                    );
                }
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
        $query = \App\Models\SellerTransaction::where('seller_id', $sellerId)
            ->whereIn('type', [
                \App\Models\SellerTransaction::TYPE_EARNING,
                \App\Models\SellerTransaction::TYPE_REFUND,
                \App\Models\SellerTransaction::TYPE_REVERSAL
            ]);

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $transactions = $query->get();

        $totalSales = 0;
        $totalPlatformCommission = 0;
        $totalPlatformCommissionGst = 0;
        $totalGatewayFee = 0;
        $totalShippingCharge = 0;
        $totalTcs = 0;
        $totalTds = 0;
        $totalEarnings = 0;
        $orderIds = [];

        foreach ($transactions as $txn) {
            $meta = $txn->metadata ?? [];
            $isEarning = $txn->type === \App\Models\SellerTransaction::TYPE_EARNING;
            
            $salesDelta = (float)($meta['order_total'] ?? $txn->amount);
            $commissionDelta = (float)($meta['platform_commission'] ?? 0);
            $gstDelta = (float)($meta['platform_commission_gst'] ?? 0);
            $gatewayDelta = (float)($meta['gateway_fee'] ?? 0);
            $shippingDelta = (float)($meta['shipping_charge'] ?? 0);
            $tcsDelta = (float)($txn->tcs_deduction);
            $tdsDelta = (float)($txn->tds_deduction);
            $earningsDelta = (float)$txn->amount;

            if ($isEarning) {
                $totalSales += $salesDelta;
                $totalPlatformCommission += $commissionDelta;
                $totalPlatformCommissionGst += $gstDelta;
                $totalGatewayFee += $gatewayDelta;
                $totalShippingCharge += $shippingDelta;
                $totalTcs += $tcsDelta;
                $totalTds += $tdsDelta;
                $totalEarnings += $earningsDelta;
                if ($txn->order_id) {
                    $orderIds[$txn->order_id] = true;
                }
            } else {
                $totalSales -= $salesDelta;
                $totalPlatformCommission -= $commissionDelta;
                $totalPlatformCommissionGst -= $gstDelta;
                $totalGatewayFee -= $gatewayDelta;
                $totalShippingCharge -= $shippingDelta;
                $totalTcs -= $tcsDelta;
                $totalTds -= $tdsDelta;
                $totalEarnings -= $earningsDelta;
                if ($txn->order_id) {
                    unset($orderIds[$txn->order_id]);
                }
            }
        }

        $currentCommission = $this->getSellerCommissionRate($sellerId);
        $sellerUser = \App\Models\User::find($sellerId);
        $sellerProfile = $sellerUser ? $sellerUser->sellerProfile : null;
        $tcsRate = (float)($sellerProfile->tcs_rate ?? 1.00);
        $tdsRate = (float)($sellerProfile->tds_rate ?? 1.00);

        return [
            'total_sales' => round($totalSales, 2),
            'total_platform_commission' => round($totalPlatformCommission, 2),
            'total_platform_commission_gst' => round($totalPlatformCommissionGst, 2),
            'total_gateway_fee' => round($totalGatewayFee, 2),
            'total_shipping_charge' => round($totalShippingCharge, 2),
            'total_tcs' => round($totalTcs, 2),
            'total_tds' => round($totalTds, 2),
            'total_earnings' => round($totalEarnings, 2),
            'current_commission_rate' => [
                'platform' => $currentCommission->base_commission_percentage,
                'gateway' => $currentCommission->payment_gateway_percentage,
                'total' => $currentCommission->effective_commission_percentage,
                'tcs' => $tcsRate,
                'tds' => $tdsRate,
            ],
            'order_count' => count($orderIds),
        ];
    }
}
