<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    /**
     * Deduct stock for a product with pessimistic locking.
     */
    public function decrementStock(int $productId, int $quantity): Product
    {
        return DB::transaction(function () use ($productId, $quantity) {
            $product = Product::where('id', $productId)->lockForUpdate()->firstOrFail();

            if ($product->stock < $quantity) {
                throw new \Exception("Insufficient stock for product: {$product->title}");
            }

            $product->stock -= $quantity;
            $product->stock_status = $this->determineStockStatus($product->stock);
            $product->save();

            Log::info("InventoryService: Decremented stock for Product #{$productId} by {$quantity}. New stock: {$product->stock}");

            return $product;
        });
    }

    /**
     * Restore stock for a product.
     */
    public function restoreStock(int $productId, int $quantity): Product
    {
        return DB::transaction(function () use ($productId, $quantity) {
            $product = Product::where('id', $productId)->lockForUpdate()->firstOrFail();

            $product->stock += $quantity;
            $product->stock_status = $this->determineStockStatus($product->stock);
            $product->save();

            Log::info("InventoryService: Restored stock for Product #{$productId} by {$quantity}. New stock: {$product->stock}");

            return $product;
        });
    }

    /**
     * Helper to determine stock status based on count.
     */
    private function determineStockStatus(int $stock): string
    {
        if ($stock <= 0) {
            return 'out_of_stock';
        } elseif ($stock <= 10) {
            return 'low_stock';
        }
        return 'in_stock';
    }
}
