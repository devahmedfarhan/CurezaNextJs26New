<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $orders = DB::table('orders')->get();
    echo "=== ORDERS TABLE ===\n";
    foreach ($orders as $order) {
        echo "Order ID: {$order->id} | Order #: {$order->order_number} | Status: {$order->status} | Pay Status: {$order->payment_status} | Final Amt: {$order->final_amount}\n";
    }

    $items = DB::table('order_items')->get();
    echo "\n=== ORDER ITEMS TABLE ===\n";
    foreach ($items as $item) {
        echo "Item ID: {$item->id} | Order ID: {$item->order_id} | Product: {$item->product_name} | Seller ID: {$item->seller_id} | Qty: {$item->quantity} | Total: {$item->total} | Item Status: {$item->status}\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
