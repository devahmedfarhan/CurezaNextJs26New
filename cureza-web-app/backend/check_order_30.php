<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$order = App\Models\Order::with('shipments')->find(30);
if ($order) {
    echo "Order 30 found:\n";
    echo "Status: '{$order->status}'\n";
    echo "Payment Status: '{$order->payment_status}'\n";
    echo "Payment Method: '{$order->payment_method}'\n";
    foreach ($order->shipments as $ship) {
        echo "Shipment ID: {$ship->id}\n";
        echo "Shipment Status: '{$ship->status}'\n";
        echo "Payout Status: '{$ship->payout_status}'\n";
        echo "Remittance Status: '{$ship->remittance_status}'\n";
    }
} else {
    echo "Order 30 not found\n";
}
