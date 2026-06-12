<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

try {
    echo "=== TESTING ADMIN PRODUCT EDIT FLOW ===\n";

    // 1. Fetch Admin User
    $admin = User::where('role', 'super_admin')->first();
    if (!$admin) {
        $admin = User::where('role', 'admin')->first();
    }
    
    if (!$admin) {
        throw new \Exception("No admin user found.");
    }

    echo "Found Admin: {$admin->name} (ID: {$admin->id}, Role: {$admin->role})\n";

    // 2. Fetch a product to edit
    $product = Product::first();
    if (!$product) {
        throw new \Exception("No products found to edit.");
    }

    echo "Editing Product: {$product->title} (ID: {$product->id})\n";

    // 3. Log in as admin
    Auth::login($admin);
    echo "Logged in successfully.\n";

    // 4. Construct a mock request for updating the product
    $requestData = [
        '_method' => 'PUT',
        'title' => 'Admin Edited Product Name',
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'price' => '899.00',
        'stock' => 150,
        'stock_status' => 'in_stock',
        'status' => 'published',
        'brand_id' => $product->brand_id,
    ];

    echo "Sending update request to ProductController...\n";

    $request = Request::create("/api/admin/products/{$product->id}", 'POST', $requestData);
    $request->setUserResolver(function () use ($admin) {
        return $admin;
    });

    $controller = new ProductController();
    $response = $controller->update($request, $product->id);

    echo "HTTP Status Code: " . $response->getStatusCode() . "\n";
    $content = json_decode($response->getContent(), true);

    if ($response->getStatusCode() === 200) {
        echo "Product updated successfully! Response:\n";
        print_r($content);
        echo "=== TEST SUCCESSFUL ===\n";
    } else {
        echo "ERROR: Failed to update product. Response Content:\n";
        print_r($content);
        echo "=== TEST FAILED ===\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " in " . $e->getFile() . "\n";
    echo "=== TEST FAILED ===\n";
}
