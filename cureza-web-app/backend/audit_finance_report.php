<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shipment;
use App\Models\Appointment;
use App\Models\SellerWallet;
use App\Models\SellerTransaction;
use App\Models\Payout;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\CommissionService;

echo "==================================================\n";
echo "          CUREZA FINANCE AUDIT REPORT\n";
echo "==================================================\n\n";

// 1. GENERAL STATISTICS
echo "--- 1. General User & Entity Statistics ---\n";
$userCounts = User::groupBy('role')->selectRaw('role, count(*) as count')->pluck('count', 'role');
foreach (['customer', 'vendor', 'doctor', 'admin', 'super_admin'] as $role) {
    $count = $userCounts[$role] ?? 0;
    echo "Total " . ucfirst($role) . "s: {$count}\n";
}
echo "\n";

// 2. ORDER FINANCE (Sellers & Super Admin)
echo "--- 2. Order Finance Details ---\n";
$totalOrders = Order::count();
$deliveredOrders = Order::whereIn('status', ['delivered', 'cod_reconciled'])->get();
$deliveredCount = $deliveredOrders->count();

$totalSalesVal = Order::sum('final_amount');
$deliveredSalesVal = $deliveredOrders->sum('final_amount');
$calculatedCommissions = $deliveredOrders->sum('platform_commission_amount');
$calculatedGateway = $deliveredOrders->sum('payment_gateway_fee');
$calculatedSellerEarnings = $deliveredOrders->sum('seller_earnings');

echo "Total Orders: {$totalOrders}\n";
echo "Delivered/Reconciled Orders: {$deliveredCount}\n";
echo "Total Sales Volume (All Orders): ₹" . number_format($totalSalesVal, 2) . "\n";
echo "Total Sales Volume (Delivered/Reconciled Orders): ₹" . number_format($deliveredSalesVal, 2) . "\n";
echo "Calculated Admin Commissions (Delivered/Reconciled): ₹" . number_format($calculatedCommissions, 2) . "\n";
echo "Calculated Payment Gateway Fees (Delivered/Reconciled): ₹" . number_format($calculatedGateway, 2) . "\n";
echo "Calculated Seller Earnings (Delivered/Reconciled): ₹" . number_format($calculatedSellerEarnings, 2) . "\n";

// Check order commission calculations logic
$orderDiscrepancies = [];
foreach ($deliveredOrders as $order) {
    if (!$order->commission_calculated_at) {
        $orderDiscrepancies[] = "Order #{$order->order_number} (ID: {$order->id}) is DELIVERED but commission has NOT been calculated (commission_calculated_at is NULL).";
        continue;
    }
    
    // Recalculate commission
    $commService = new CommissionService();
    $recalculated = $commService->calculateOrderCommission($order);
    
    $expectedComm = $recalculated['totals']['platform_commission'];
    $expectedGateway = $recalculated['totals']['gateway_fee'];
    $expectedEarnings = $recalculated['totals']['seller_earnings'];
    
    $diffComm = abs($order->platform_commission_amount - $expectedComm);
    $diffGateway = abs($order->payment_gateway_fee - $expectedGateway);
    $diffEarnings = abs($order->seller_earnings - $expectedEarnings);
    
    if ($diffComm > 0.05 || $diffGateway > 0.05 || $diffEarnings > 0.05) {
        $orderDiscrepancies[] = "Order #{$order->order_number} Discrepancy:\n" . 
                                "  Database: Comm=₹{$order->platform_commission_amount}, Gateway=₹{$order->payment_gateway_fee}, Earnings=₹{$order->seller_earnings}\n" .
                                "  Expected: Comm=₹{$expectedComm}, Gateway=₹{$expectedGateway}, Earnings=₹{$expectedEarnings}";
    }
}

if (empty($orderDiscrepancies)) {
    echo "✅ No Order Commission Discrepancies found (All delivered orders commission matches CommissionService logic).\n";
} else {
    echo "⚠️ Discrepancies / Anomalies in Order Commissions:\n";
    foreach ($orderDiscrepancies as $disc) {
        echo "  - {$disc}\n";
    }
}
echo "\n";


// 3. SELLER WALLETS & TRANSACTIONS
echo "--- 3. Seller Wallets & Payouts ---\n";
$sellerWallets = SellerWallet::with('seller')->get();
$walletDiscrepancies = [];

foreach ($sellerWallets as $wallet) {
    $seller = $wallet->seller;
    if (!$seller) {
        $walletDiscrepancies[] = "Orphan Seller Wallet ID: {$wallet->id} (Seller ID {$wallet->seller_id} does not exist in users).";
        continue;
    }
    
    $available = (float)$wallet->available_balance;
    $pending = (float)$wallet->pending_amount;
    $paid = (float)$wallet->paid_amount;
    $onHold = (float)$wallet->on_hold_amount;
    $totalEarnings = (float)$wallet->total_earnings;
    
    // Balance reconciliation check: total_earnings should equal available + pending + paid + on_hold (approx)
    $sum = $available + $pending + $paid + $onHold;
    $diff = abs($totalEarnings - $sum);
    
    // Also cross check with delivered/reconciled orders for this seller
    $deliveredOrdersForSeller = Order::whereHas('items', function($q) use ($seller) {
            $q->where('seller_id', $seller->id);
        })
        ->whereIn('status', ['delivered', 'cod_reconciled'])
        ->get();
        
    $deliveredSum = 0;
    foreach ($deliveredOrdersForSeller as $order) {
        $recalculated = (new CommissionService())->calculateOrderCommission($order);
        if (isset($recalculated['breakdown'][$seller->id])) {
            $deliveredSum += $recalculated['breakdown'][$seller->id]['seller_earnings'];
        }
    }
    
    // Sum of transactions of type 'earning' minus reversals
    $earningTransactions = SellerTransaction::where('seller_id', $seller->id)->where('type', 'earning')->sum('amount');
    $payoutTransactions = SellerTransaction::where('seller_id', $seller->id)->where('type', 'payout')->sum('amount');
    
    echo "Seller: {$seller->name} (Email: {$seller->email})\n";
    echo "  Wallet Total Earnings: ₹" . number_format($totalEarnings, 2) . "\n";
    echo "  Wallet Balance: Available=₹" . number_format($available, 2) . ", Pending=₹" . number_format($pending, 2) . ", OnHold=₹" . number_format($onHold, 2) . ", Paid=₹" . number_format($paid, 2) . "\n";
    echo "  Sum of Earning Transactions: ₹" . number_format($earningTransactions, 2) . "\n";
    echo "  Sum of Payout Transactions: ₹" . number_format($payoutTransactions, 2) . "\n";
    echo "  Expected Earnings from Order items: ₹" . number_format($deliveredSum, 2) . "\n";
    
    if ($diff > 0.05) {
        $walletDiscrepancies[] = "Seller {$seller->name} wallet sum discrepancy: total_earnings (₹{$totalEarnings}) != sum of states (₹{$sum}). Diff = ₹{$diff}";
    }
    
    $orderEarnDiff = abs($totalEarnings - $deliveredSum);
    if ($orderEarnDiff > 1.0) {
        $walletDiscrepancies[] = "Seller {$seller->name} wallet earnings discrepancy: wallet total_earnings (₹{$totalEarnings}) != expected from delivered orders (₹{$deliveredSum}). Diff = ₹{$orderEarnDiff}";
    }
    
    $payoutDiff = abs($paid - $payoutTransactions);
    if ($payoutDiff > 0.05) {
        $walletDiscrepancies[] = "Seller {$seller->name} payouts discrepancy: wallet paid_amount (₹{$paid}) != sum of payout transactions (₹{$payoutTransactions}). Diff = ₹{$payoutDiff}";
    }
}

if (empty($walletDiscrepancies)) {
    echo "✅ No Seller Wallet Discrepancies found (All balances reconcile perfectly).\n";
} else {
    echo "⚠️ Seller Wallet Reconciliation Discrepancies:\n";
    foreach ($walletDiscrepancies as $disc) {
        echo "  - {$disc}\n";
    }
}
echo "\n";


// 4. DOCTOR FINANCE (Appointments)
echo "--- 4. Doctor Finance Details ---\n";
$completedAppointments = Appointment::where('status', 'completed')->with('doctor')->get();
$completedCount = $completedAppointments->count();
$totalApptSales = Appointment::sum('amount');
$completedApptSales = $completedAppointments->sum('amount');

echo "Total Booked Appointments: " . Appointment::count() . "\n";
echo "Completed Appointments: {$completedCount}\n";
echo "Total Consultation Revenue (All bookings): ₹" . number_format($totalApptSales, 2) . "\n";
echo "Completed Consultation Revenue: ₹" . number_format($completedApptSales, 2) . "\n";

$doctorEarningsData = [];
$doctorDiscrepancies = [];

foreach ($completedAppointments as $appt) {
    $doctor = $appt->doctor;
    if (!$doctor) continue;
    
    $amt = (float)$appt->amount;
    $isFollowUp = $appt->is_follow_up == 1 || $appt->is_follow_up == true;
    if ($isFollowUp) {
        $docShareRate = 1.0;
    } else if ($appt->consultation_type === 'chat') {
        $docShareRate = 0.80;
    } else {
        $docShareRate = 0.85;
    }
    
    $docEarning = $amt * $docShareRate;
    $adminCommission = $amt * (1 - $docShareRate);
    
    if (!isset($doctorEarningsData[$doctor->id])) {
        $doctorEarningsData[$doctor->id] = [
            'name' => $doctor->name,
            'email' => $doctor->email,
            'completed_bookings' => 0,
            'gross' => 0.0,
            'earnings' => 0.0,
            'commission' => 0.0,
        ];
    }
    
    $doctorEarningsData[$doctor->id]['completed_bookings']++;
    $doctorEarningsData[$doctor->id]['gross'] += $amt;
    $doctorEarningsData[$doctor->id]['earnings'] += $docEarning;
    $doctorEarningsData[$doctor->id]['commission'] += $adminCommission;
}

$totalDocEarnings = 0;
$totalDocCommissions = 0;
foreach ($doctorEarningsData as $docId => $data) {
    echo "Doctor: {$data['name']} (Email: {$data['email']})\n";
    echo "  Completed Consultations: {$data['completed_bookings']}\n";
    echo "  Gross Sales: ₹" . number_format($data['gross'], 2) . "\n";
    echo "  Doctor Earnings (Share): ₹" . number_format($data['earnings'], 2) . "\n";
    echo "  Platform Commission: ₹" . number_format($data['commission'], 2) . "\n";
    $totalDocEarnings += $data['earnings'];
    $totalDocCommissions += $data['commission'];
}

echo "Total Completed Doctor Earnings: ₹" . number_format($totalDocEarnings, 2) . "\n";
echo "Total Completed Doctor Platform Commissions: ₹" . number_format($totalDocCommissions, 2) . "\n";

// Check if doctor has standard wallet or is doctor finance just pull from completed appts.
// Let's look up if there are any payouts for doctors
$doctorPayouts = Payout::whereHas('user', function($q) { $q->where('role', 'doctor'); })->get();
if ($doctorPayouts->count() > 0) {
    echo "Doctor Payouts in DB:\n";
    foreach ($doctorPayouts as $payout) {
        echo "  Doctor ID {$payout->user_id}: Amount=₹{$payout->requested_amount}, Status={$payout->status}, Txn ID={$payout->transaction_id}\n";
    }
} else {
    echo "ℹ️ No Doctor Payouts registered in the database.\n";
}
echo "\n";


// 5. CUSTOMER WALLETS & PAYMENTS
echo "--- 5. Customer Wallets & Payments ---\n";
$customerWallets = Wallet::with('user')->get();
if ($customerWallets->count() > 0) {
    foreach ($customerWallets as $cWallet) {
        $user = $cWallet->user;
        if (!$user) continue;
        echo "Customer Wallet - {$user->name} (Email: {$user->email}):\n";
        echo "  Balance: ₹" . number_format($cWallet->balance, 2) . "\n";
        echo "  Points: " . $cWallet->points . "\n";
        
        $cTxns = WalletTransaction::where('wallet_id', $cWallet->id)->get();
        if ($cTxns->count() > 0) {
            echo "  Transactions:\n";
            foreach ($cTxns as $ctx) {
                echo "    - Date: {$ctx->created_at}, Type: {$ctx->type}, Amount: ₹{$ctx->amount}, Points: {$ctx->points}, Description: {$ctx->description}\n";
            }
        } else {
            echo "    (No transaction history)\n";
        }
    }
} else {
    echo "ℹ️ No Customer Wallets registered in the database.\n";
}
echo "\n";


// 6. REVENUE RECONCILIATION SUMMARY FOR SUPER ADMIN
echo "--- 6. Super Admin Revenue Reconciliation Summary ---\n";
$superAdminTotalEarnings = $calculatedCommissions + $totalDocCommissions;
echo "Super Admin Total Earnings from Platform Commissions:\n";
echo "  From Order Commissions: ₹" . number_format($calculatedCommissions, 2) . "\n";
echo "  From Doctor Consultation Commissions: ₹" . number_format($totalDocCommissions, 2) . "\n";
echo "  Total Platform Net Commission Earnings: ₹" . number_format($superAdminTotalEarnings, 2) . "\n";
echo "\n";

echo "=== FINANCE AUDIT COMPLETED ===\n";
