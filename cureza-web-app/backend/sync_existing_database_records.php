<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    echo "=========================================\n";
    echo "STARTING DATABASE SYNCHRONIZATION CLEANUP\n";
    echo "=========================================\n\n";

    // 1. Sync Order Statuses with Order Items
    echo "--- 1. Syncing Order Items Status ---\n";
    $orders = Order::all();
    $orderItemsUpdated = 0;

    foreach ($orders as $order) {
        $items = $order->items;
        foreach ($items as $item) {
            if ($item->status !== $order->status) {
                echo "Order #{$order->order_number}: Updating Item '{$item->product_name}' status from '{$item->status}' to '{$order->status}'\n";
                $item->status = $order->status;
                $item->save();
                $orderItemsUpdated++;
            }
        }
    }
    echo "Total Order Items status updated: {$orderItemsUpdated}\n\n";

    // 2. Sync GST & Company Name for Sellers
    echo "--- 2. Syncing GST & Company Details for Sellers ---\n";
    $sellers = User::where('role', 'seller')->get();
    $sellerDetailsUpdated = 0;

    foreach ($sellers as $seller) {
        $profile = $seller->sellerProfile;
        $brand = $seller->brand;
        $updated = false;

        // GST Number Sync
        if ($profile && $profile->gst_number) {
            if ($seller->gst_number !== $profile->gst_number) {
                echo "Seller '{$seller->name}': Syncing User GST '{$seller->gst_number}' with Profile GST '{$profile->gst_number}'\n";
                $seller->gst_number = $profile->gst_number;
                $updated = true;
            }
        } elseif ($seller->gst_number && $profile) {
            echo "Seller '{$seller->name}': Syncing Profile GST with User GST '{$seller->gst_number}'\n";
            $profile->gst_number = $seller->gst_number;
            $profile->save();
        }

        // Company Name / Brand Name Sync
        if ($brand && $brand->name) {
            if ($seller->company_name !== $brand->name) {
                echo "Seller '{$seller->name}': Syncing User Company '{$seller->company_name}' with Brand Name '{$brand->name}'\n";
                $seller->company_name = $brand->name;
                $updated = true;
            }
        } elseif ($seller->company_name && $brand) {
            echo "Seller '{$seller->name}': Syncing Brand Name with User Company '{$seller->company_name}'\n";
            $brand->name = $seller->company_name;
            $brand->save();
        }

        if ($updated) {
            $seller->save();
            $sellerDetailsUpdated++;
        }
    }
    echo "Total Sellers details synchronized: {$sellerDetailsUpdated}\n\n";

    DB::commit();
    echo "=========================================\n";
    echo "DATABASE CLEANUP COMPLETED SUCCESSFULLY!\n";
    echo "=========================================\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "Error during cleanup: " . $e->getMessage() . "\n";
}
