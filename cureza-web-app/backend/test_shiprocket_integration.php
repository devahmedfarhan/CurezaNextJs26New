<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shipment;
use App\Http\Controllers\SellerOrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

try {
    echo "=== STARTING SHIPROCKET INTEGRATION USER JOURNEY VERIFICATION ===\n\n";

    // 1. Fetch/Create a Test Seller and Buyer
    $seller = User::where('email', 'aurawellness@cureza-seller.com')->first();
    if (!$seller) {
        // Fallback to first user
        $seller = User::first();
        if (!$seller) {
            throw new \Exception("No user found in the database. Please seed the database first.");
        }
    }
    echo "1. Using Seller: {$seller->name} (ID: {$seller->id})\n";

    $buyer = User::where('email', '!=', $seller->email)->first();
    if (!$buyer) {
        $buyer = $seller;
    }
    echo "2. Using Buyer: {$buyer->name} (ID: {$buyer->id})\n";

    // Ensure seller has a SellerProfile for pickup point code nick-naming
    $sellerProfile = \App\Models\SellerProfile::where('user_id', $seller->id)->first();
    if (!$sellerProfile) {
        echo "Creating mock SellerProfile for vendor...\n";
        $sellerProfile = \App\Models\SellerProfile::create([
            'user_id' => $seller->id,
            'company_name' => 'Aura Wellness Store',
            'store_description' => 'Tested wellness items',
            'tax_number' => '27AAAAA1111A1Z1',
            'bank_account_number' => '1234567890',
            'bank_ifsc' => 'HDFC0001234',
            'status' => 'approved'
        ]);
    }

    // 3. Create a mock order and order items
    DB::beginTransaction();

    $product = Product::first();
    if (!$product) {
        echo "Creating mock Product for verification...\n";
        $product = Product::create([
            'title' => 'Verification Wellness Product',
            'slug' => 'verification-wellness-product-' . rand(100, 999),
            'price' => 200.00,
            'original_price' => 250.00,
            'stock' => 10,
            'status' => 'published',
            'sku' => 'TEST-WELLNESS-' . rand(100, 999)
        ]);
    }

    $order = Order::create([
        'order_number' => 'CUR-TEST-' . rand(10000, 99999),
        'user_id' => $buyer->id,
        'total_amount' => 260.00,
        'discount_amount' => 0.00,
        'tax_amount' => 0.00,
        'shipping_amount' => 60.00,
        'final_amount' => 260.00,
        'status' => 'pending',
        'payment_status' => 'pending',
        'payment_method' => 'cod',
        'shipping_address_json' => [
            'name' => 'John Buyer',
            'address' => '456 Test Lane, Sector 5',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'pincode' => '400001',
            'zip' => '400001',
            'phone' => '9876543210'
        ],
        'billing_address_json' => [
            'name' => 'John Buyer',
            'address' => '456 Test Lane, Sector 5',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'pincode' => '400001',
            'zip' => '400001',
            'phone' => '9876543210'
        ]
    ]);

    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'seller_id' => $seller->id,
        'product_name' => $product->title,
        'quantity' => 1,
        'price' => 200.00,
        'total' => 200.00,
        'status' => 'pending'
    ]);

    echo "3. Created test Order: {$order->order_number} (ID: {$order->id}, Total: INR {$order->final_amount})\n";

    // Log in as the seller to make the controller calls
    Auth::login($seller);

    // 4. Test rate calculation serviceability check directly
    $shiprocket = new \App\Services\ShiprocketService();
    echo "\n=== Step A: Checking Shiprocket Serviceability ===\n";
    $rateCard = $shiprocket->checkServiceability('110001', '400001', 1.5, true);
    if ($rateCard['success']) {
        echo "SUCCESS: Courier partners retrieved!\n";
        foreach ($rateCard['data']['available_couriers'] as $courier) {
            echo " - {$courier['courier_name']}: Rate INR {$courier['rate']}, ETD: {$courier['etd']}\n";
        }
    } else {
        echo "FAILED: " . json_encode($rateCard['error']) . "\n";
    }

    // 5. Simulate booking the shipment via SellerOrderController
    echo "\n=== Step B: Booking Shipment via Seller Panel ===\n";
    $bookRequest = Request::create("/api/seller/orders/{$order->id}/book-shipment", 'POST', [
        'pickup_slot' => 'slot_1',
        'weight' => 1.5,
        'dimensions_l' => 12,
        'dimensions_w' => 12,
        'dimensions_h' => 10
    ]);
    
    $bookRequest->setUserResolver(function () use ($seller) {
        return $seller;
    });

    $controller = new SellerOrderController();
    $response = $controller->bookShipment($bookRequest, $order->id);
    $bookData = json_decode($response->getContent(), true);

    echo "HTTP Status Code: " . $response->getStatusCode() . "\n";
    if ($response->getStatusCode() === 200) {
        echo "SUCCESS: Shipment booked successfully!\n";
        $shipment = Shipment::where('order_id', $order->id)->where('seller_id', $seller->id)->first();
        echo " - Assigned AWB: {$shipment->tracking_number}\n";
        echo " - Assigned Courier: {$shipment->courier_name}\n";
        echo " - Shipping Charge: INR {$shipment->shipping_charge}\n";
        echo " - Shipment Status: {$shipment->status}\n";
        echo " - Order Status: {$order->fresh()->status}\n";
    } else {
        throw new \Exception("Failed to book shipment: " . json_encode($bookData));
    }

    // 6. Test Shipment Label Download URL fetching
    echo "\n=== Step C: Fetching Shipping Label URL ===\n";
    $labelUrl = $shiprocket->getLabelUrl($shipment->payout_transaction_id);
    echo "SUCCESS: Shipping label URL is: {$labelUrl}\n";

    // 7. Simulate "Picked Up" webhook loopback
    echo "\n=== Step D: Simulating Courier 'Picked Up' Status ===\n";
    $simRequest = Request::create("/api/seller/orders/{$shipment->id}/simulate-shipment", 'POST', [
        'status' => 'picked_up'
    ]);
    $simRequest->setUserResolver(function () use ($seller) {
        return $seller;
    });

    $response = $controller->simulateShipmentStatus($simRequest, $shipment->id);
    $simData = json_decode($response->getContent(), true);
    
    if ($response->getStatusCode() === 200) {
        $shipment->refresh();
        $order->refresh();
        echo "SUCCESS: Webhook callback resolved successfully!\n";
        echo " - Webhook response: " . json_encode($simData['webhook_response']) . "\n";
        echo " - Updated Shipment Status: {$shipment->status}\n";
        echo " - Updated Order Status: {$order->status}\n";
        if ($shipment->status === 'picked_up' && $order->status === 'shipped') {
            echo " - Status mapped correctly to CUREZA internal 'shipped' state.\n";
        } else {
            throw new \Exception("Status mapping failed on Picked Up event.");
        }
    } else {
        throw new \Exception("Simulation failed: " . json_encode($simData));
    }

    // 8. Simulate "Out for Delivery" webhook loopback
    echo "\n=== Step E: Simulating Courier 'Out for Delivery' Status ===\n";
    $simRequest = Request::create("/api/seller/orders/{$shipment->id}/simulate-shipment", 'POST', [
        'status' => 'out_for_delivery'
    ]);
    $simRequest->setUserResolver(function () use ($seller) {
        return $seller;
    });

    $response = $controller->simulateShipmentStatus($simRequest, $shipment->id);
    $simData = json_decode($response->getContent(), true);
    
    if ($response->getStatusCode() === 200) {
        $shipment->refresh();
        $order->refresh();
        echo "SUCCESS: Webhook callback resolved successfully!\n";
        echo " - Updated Shipment Status: {$shipment->status}\n";
        echo " - Updated Order Status: {$order->status}\n";
        if ($shipment->status === 'out_for_delivery' && $order->status === 'out_for_delivery') {
            echo " - Status mapped correctly to CUREZA internal 'out_for_delivery' state.\n";
        } else {
            throw new \Exception("Status mapping failed on Out for Delivery event.");
        }
    } else {
        throw new \Exception("Simulation failed: " . json_encode($simData));
    }

    // 9. Simulate "Delivered" webhook loopback
    echo "\n=== Step F: Simulating Courier 'Delivered' Status ===\n";
    $simRequest = Request::create("/api/seller/orders/{$shipment->id}/simulate-shipment", 'POST', [
        'status' => 'delivered'
    ]);
    $simRequest->setUserResolver(function () use ($seller) {
        return $seller;
    });

    $response = $controller->simulateShipmentStatus($simRequest, $shipment->id);
    $simData = json_decode($response->getContent(), true);
    
    if ($response->getStatusCode() === 200) {
        $shipment->refresh();
        $order->refresh();
        echo "SUCCESS: Webhook callback resolved successfully!\n";
        echo " - Updated Shipment Status: {$shipment->status}\n";
        echo " - Updated Order Status: {$order->status}\n";
        echo " - Updated Order Payment Status: {$order->payment_status}\n";
        echo " - Updated Shipment Remittance: {$shipment->remittance_status}\n";

        if ($shipment->status === 'delivered' && $order->status === 'delivered' && $order->payment_status === 'paid' && $shipment->remittance_status === 'remitted') {
            echo " - Status mapped correctly to CUREZA internal completed status.\n";
            echo " - COD payment successfully marked as PAID.\n";
            echo " - COD shipment remittance successfully marked as REMITTED.\n";
        } else {
            throw new \Exception("Status mapping failed on Delivered event.");
        }
    } else {
        throw new \Exception("Simulation failed: " . json_encode($simData));
    }

    // Rollback test data from database
    DB::rollBack();
    echo "\n=== Verification Clean Up Completed (Database Rolled Back) ===\n";
    echo "\n=== ALL SHIPROCKET FLOW TESTS COMPLETED SUCCESSFULLY ✓ ===\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR: Verification failed!\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " in file " . $e->getFile() . "\n";
}
