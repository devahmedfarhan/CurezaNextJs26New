<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Find the Seller User
$brandName = "Noelle Rosa";
$brand = \App\Models\Brand::where('name', $brandName)->first();

if (!$brand) {
    echo "Brand '$brandName' not found.\n";
    
    // Fallback: Try to find a user with this name directly
    $user = \App\Models\User::where('name', $brandName)->first();
    if (!$user) {
        echo "User '$brandName' not found either.\n";
        exit;
    }
} else {
    $user = \App\Models\User::find($brand->user_id);
    echo "Found Brand '$brandName'. Linked User ID: {$user->id} ({$user->name})\n";
}

$sellerId = $user->id;

// 2. Check Products
$productsCount = \App\Models\Product::where('seller_id', $sellerId)->count();
echo "Seller has {$productsCount} products.\n";

// 3. Check Order Items
$items = \App\Models\OrderItem::where('seller_id', $sellerId)->get();
echo "Found " . $items->count() . " order items for this seller.\n";

if ($items->count() > 0) {
    $orderIds = $items->pluck('order_id')->unique();
    echo "These items belong to Orders: " . $orderIds->implode(', ') . "\n";
    
    // 4. Check Orders
    $orders = \App\Models\Order::whereIn('id', $orderIds)->get();
    echo "Found " . $orders->count() . " actual Orders in database.\n";
    
    // 5. Simulate Controller Logic
    $queryOrders = \App\Models\Order::whereHas('items', function ($q) use ($sellerId) {
        $q->where('seller_id', $sellerId);
    })->get();
    
    echo "Controller Logic returns " . $queryOrders->count() . " orders.\n";
} else {
    echo "CRITICAL: No order items found with seller_id = $sellerId.\n";
    // Check some random items to see what seller_id they have
    $randomItem = \App\Models\OrderItem::first();
    if ($randomItem) {
        echo "Sample Item ID {$randomItem->id} has seller_id: " . ($randomItem->seller_id ?? 'NULL') . "\n";
    }
}
