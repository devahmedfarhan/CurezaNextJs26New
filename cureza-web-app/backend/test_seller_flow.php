<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductChangeRequest;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

try {
    echo "=== TESTING SELLER PRODUCT CREATION FLOW ===\n";

    // 1. Fetch one of the seeded sellers
    $seller = User::where('email', 'aurawellness@cureza-seller.com')->first();
    if (!$seller) {
        throw new \Exception("Seeded seller 'aurawellness@cureza-seller.com' not found. Run seeder first.");
    }

    echo "Found Seller: {$seller->name} (ID: {$seller->id}, Brand: " . ($seller->brand ? $seller->brand->name : 'None') . ")\n";

    // 2. Fetch a category to assign
    $category = Category::where('type', 'category')->first();
    if (!$category) {
        throw new \Exception("No category found.");
    }

    echo "Using Category: {$category->name} (ID: {$category->id})\n";

    // 3. Log in as this seller
    Auth::login($seller);
    echo "Logged in successfully.\n";

    // 4. Construct a mock Request for storing a product
    $requestData = [
        'title' => 'Test Flow Product',
        'sku' => 'FLOW-TEST-' . rand(100, 999),
        'category_id' => $category->id,
        'price' => '499.00',
        'original_price' => '699.00',
        'stock' => 120,
        'stock_status' => 'in_stock',
        'short_description' => 'A description to test the API product flow.',
        'long_description' => '<p>A long description for the test flow product to verify text saving.</p>',
        'highlights' => ['Flow Tested', 'Safe and Secure', 'Tested by Developer'],
        'specifications' => [
            ['key' => 'Test Key 1', 'value' => 'Test Value 1'],
            ['key' => 'Test Key 2', 'value' => 'Test Value 2']
        ],
        'tags' => ['TestTag1', 'TestTag2'],
        'faqs' => [
            ['question' => 'Flow test question?', 'answer' => 'Flow test answer.']
        ],
        'additional_info' => [
            'tabs' => [
                ['title' => 'Flow Use', 'content' => '<p>Flow use content</p>']
            ]
        ],
        'status' => 'draft' // Non-admin status
    ];

    echo "Sending store request to ProductController...\n";

    $request = Request::create('/api/seller/products', 'POST', $requestData);
    // Explicitly set the authenticated user on the request
    $request->setUserResolver(function () use ($seller) {
        return $seller;
    });

    $controller = new ProductController();
    $response = $controller->store($request);

    echo "HTTP Status Code: " . $response->getStatusCode() . "\n";
    $content = json_decode($response->getContent(), true);

    if ($response->getStatusCode() === 201) {
        echo "Product created successfully! Response:\n";
        print_r($content);

        // Verify the product in DB
        $productId = $content['product']['id'];
        $product = Product::find($productId);
        echo "\nDatabase Check - Product Name: {$product->title}\n";
        echo "Database Check - Product Status: {$product->status}\n";
        echo "Database Check - Brand: " . $product->brand->name . "\n";
        echo "Database Check - Highlights Count: " . count($product->highlights) . "\n";
        echo "Database Check - Tags Cast Check: " . (is_array($product->tags) ? 'Array' : 'String') . "\n";

        // Verify the ProductChangeRequest is created
        $changeRequest = ProductChangeRequest::where('product_id', $productId)->first();
        if ($changeRequest) {
            echo "Database Check - ProductChangeRequest created! Status: {$changeRequest->status}, Type: {$changeRequest->change_type}\n";
            
            // Clean up test data
            echo "\nCleaning up test flow product and request...\n";
            $changeRequest->delete();
            $product->tags()->detach();
            $product->forceDelete();
            echo "Test product cleaned up from database.\n";
            echo "=== TEST SUCCESSFUL ===\n";
        } else {
            echo "WARNING: ProductChangeRequest NOT found in database!\n";
            echo "=== TEST FAILED ===\n";
        }
    } else {
        echo "ERROR: Failed to create product. Response Content:\n";
        print_r($content);
        echo "=== TEST FAILED ===\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " in " . $e->getFile() . "\n";
    echo "=== TEST FAILED ===\n";
}
