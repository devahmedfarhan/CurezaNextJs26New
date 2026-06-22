<?php
use App\Models\OrderItem;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$item = OrderItem::whereHas('order', function ($q) {
    $q->where('order_number', 'CZ05260001');
})->first();

if ($item) {
    echo "Item ID: {$item->id}\n";
    echo "Item Product Name: {$item->product_name}\n";
    echo "Item Status Column: '{$item->status}'\n";
    echo "Order Status Column: '{$item->order->status}'\n";
} else {
    echo "Item not found\n";
}
