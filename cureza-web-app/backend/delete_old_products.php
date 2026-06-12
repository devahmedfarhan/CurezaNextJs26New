<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    // 1. Identify the 10 new sellers' IDs
    $newSellerIds = User::where('email', 'like', '%@cureza-seller.com')
        ->pluck('id')
        ->toArray();

    echo "New Seller IDs: " . implode(', ', $newSellerIds) . "\n";

    // 2. Count products before deletion
    $totalProductsBefore = Product::withTrashed()->count();
    $newProductsCount = Product::withTrashed()->whereIn('seller_id', $newSellerIds)->count();
    $oldProductsCount = $totalProductsBefore - $newProductsCount;

    echo "Total products in database: {$totalProductsBefore}\n";
    echo "New products to keep: {$newProductsCount}\n";
    echo "Old products to remove: {$oldProductsCount}\n";

    if ($oldProductsCount === 0) {
        echo "No old products found to remove.\n";
        DB::commit();
        return;
    }

    // 3. Fetch old products
    $oldProducts = Product::withTrashed()->whereNotIn('seller_id', $newSellerIds)->get();

    echo "Deleting old products and detaching their tags...\n";
    foreach ($oldProducts as $product) {
        echo " - Deleting product: {$product->title} (ID: {$product->id})\n";
        
        // Detach tags from pivot table
        $product->tags()->detach();
        
        // Force delete from products table (bypassing SoftDeletes)
        $product->forceDelete();
    }

    $totalProductsAfter = Product::withTrashed()->count();
    echo "\nProducts remaining in database: {$totalProductsAfter}\n";

    DB::commit();
    echo "=== OLD PRODUCTS CLEANED UP SUCCESSFULLY ===\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "Error occurred: " . $e->getMessage() . "\n";
    echo "Cleanup rolled back.\n";
}
