<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use Illuminate\Support\Str;

class DemoProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sellerId = 4;
        $brandId = 3;

        // Check if seller and brand exist (Safety check)
        $seller = DB::table('users')->where('id', $sellerId)->first();
        $brand = DB::table('brands')->where('id', $brandId)->first();

        if (!$seller || !$brand) {
            $this->command->error("Seller ID $sellerId or Brand ID $brandId not found. Skipping seeding.");
            return;
        }

        $products = [
            [
                'title' => 'Cureza Daily Vitality Pack',
                'price' => 1299.00,
                'stock' => 50,
                'category_id' => 1, // Assuming category 1 exists, else nullable
                'image' => '/products/vitality-pack.jpg', // Placeholder
            ],
            [
                'title' => 'Organic Hemp Wellness Oil',
                'price' => 2499.00,
                'stock' => 30,
                'category_id' => 1,
                'image' => '/products/hemp-oil.jpg',
            ],
            [
                'title' => 'Natural Sleep Aid Gummies',
                'price' => 899.00,
                'stock' => 100,
                'category_id' => 1,
                'image' => '/products/sleep-gummies.jpg',
            ],
            [
                'title' => 'Advanced Joint Support Capsules',
                'price' => 1599.00,
                'stock' => 45,
                'category_id' => 1,
                'image' => '/products/joint-support.jpg',
            ],
            [
                'title' => 'Stress Relief Herbal Tea',
                'price' => 499.00,
                'stock' => 200,
                'category_id' => 1,
                'image' => '/products/herbal-tea.jpg',
            ],
        ];

        foreach ($products as $p) {
            $slug = Str::slug($p['title']);
            
            $product = Product::where('slug', $slug)->first();

            if ($product) {
                $this->command->info("Product {$p['title']} exists. Updating Brand/Seller...");
                $product->update([
                    'seller_id' => $sellerId,
                    'brand_id' => $brandId,
                ]);
            } else {
                Product::create([
                    'title' => $p['title'],
                    'slug' => $slug,
                    'sku' => 'SKU-' . strtoupper(Str::random(8)),
                    'price' => $p['price'],
                    'original_price' => $p['price'] * 1.2,
                    'stock' => $p['stock'],
                    'stock_status' => 'in_stock',
                    'seller_id' => $sellerId,
                    'brand_id' => $brandId,
                    'category_id' => $p['category_id'],
                    'short_description' => 'A premium product for your wellness.',
                    'long_description' => 'Full description of ' . $p['title'] . '. Made with natural ingredients.',
                    'status' => 'published',
                    'rating' => 4.5,
                    'reviews_count' => rand(10, 50),
                    'sales_count' => rand(5, 100),
                ]);
                $this->command->info("Created product: {$p['title']}");
            }
        }
    }
}
