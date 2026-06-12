<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Syncing Order Item Seller IDs with Product Seller IDs...\n";

$items = \App\Models\OrderItem::all();
$count = 0;

foreach ($items as $item) {
    $product = \App\Models\Product::find($item->product_id);
    if ($product) {
        if ($item->seller_id !== $product->seller_id) {
            echo "Item {$item->id}: Updating seller_id from " . ($item->seller_id ?? 'NULL') . " to {$product->seller_id}\n";
            $item->seller_id = $product->seller_id;
            $item->save();
            $count++;
        }
    } else {
        echo "Item {$item->id}: Product not found (ID {$item->product_id})\n";
    }
}

echo "Updated {$count} order items.\n";
