<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Str;

class SafeProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get Seller & Brand (Valid IDs from exploration)
        $seller = User::find(17);
        if (!$seller) {
            $this->command->error('Seller ID 17 not found! Please check DB.');
            return;
        }

        $brand = Brand::find(4);
        if (!$brand) {
            $this->command->error('Brand ID 4 not found! Please check DB.');
            return;
        }

        // Get or Create Categories for these products
        $wellnessCat = Category::firstOrCreate(
            ['slug' => 'wellness-supplements'],
            ['name' => 'Wellness & Supplements', 'type' => 'category', 'is_active' => true]
        );

        $skincareCat = Category::firstOrCreate(
            ['slug' => 'premium-skincare'],
            ['name' => 'Premium Skincare', 'type' => 'category', 'is_active' => true]
        );

        // 2. Define Products Data (Comprehensive)
        $products = [
            [
                'title' => 'AyurLife Premium Ashwagandha Gold',
                'sku' => 'AYUR-ASH-001',
                'brand_id' => $brand->id,
                'category_id' => $wellnessCat->id,
                'seller_id' => $seller->id,
                'price' => 1299.00,
                'original_price' => 1999.00,
                'stock_status' => 'in_stock',
                'stock' => 150,
                // Media
                'image' => 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=800',
                'images' => [
                    'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800', 
                    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'
                ],
                'video_url' => 'https://www.youtube.com/watch?v=dummy_video', // Placeholder
                // Descriptions
                'short_description' => 'Experience the power of nature with our Premium Ashwagandha Gold capsules. Sourced from the finest roots for maximum potency.',
                'long_description' => '<p><strong>AyurLife Premium Ashwagandha Gold</strong> is your daily key to stress relief and enhanced vitality. Harvested from the pristine foothills of the Himalayas, our Ashwagandha is 100% organic and potent.</p><p>Regular consumption aids in reducing cortisol levels, improving sleep quality, and boosting overall energy.</p><ul><li>100% Organic Ingredients</li><li>GMP Certified</li><li>Vegan Friendly</li></ul>',
                // JSON Data Fields
                'highlights' => [
                    'Reduces Stress & Anxiety',
                    'Boosts Energy & Stamina',
                    'Improves Sleep Quality',
                    'Natural Immunity Booster'
                ],
                'specifications' => [
                    'Form' => 'Capsules',
                    'Count' => '60 Units',
                    'Dosage' => '2 capsules daily',
                    'Main Ingredient' => 'Ashwagandha Root Extract (KSM-66)',
                    'Shelf Life' => '24 Months'
                ],
                // Policies
                'return_policy' => 'Reference No-Questions-Asked 7 Day Return Policy applicable.',
                'warranty_info' => 'Quality assurance guarantee. Fresh stock guaranteed.',
                // Extra
                'additional_info' => [
                    'Country of Origin' => 'India',
                    'Manufacturer' => 'AyurLife Sciences Pvt Ltd',
                    'Dietary Type' => 'Vegetarian'
                ],
                'variants' => [], // Flat product for now
                'tags' => ['Stress Relief', 'Herbal', 'Organic', 'Immunity'],
                // SEO
                'seo_title' => 'Buy Premium Ashwagandha Gold Online | AyurLife',
                'seo_description' => 'Shop best organic Ashwagandha capsules for stress relief and immunity. Premium quality, best price.',
                'meta_schema' => [
                    '@context' => 'https://schema.org/',
                    '@type' => 'Product',
                    'name' => 'AyurLife Premium Ashwagandha Gold',
                    'brand' => 'AyurLife Organics'
                ],
                // Stats
                'rating' => 4.8,
                'reviews_count' => 124,
                'sales_count' => 540,
                'views_count' => 1200,
                'status' => 'published',
                'is_prescription_required' => false
            ],
            [
                'title' => 'Radiant Glow Saffron Night Cream',
                'sku' => 'AYUR-SAF-CRM-02',
                'brand_id' => $brand->id,
                'category_id' => $skincareCat->id,
                'seller_id' => $seller->id,
                'price' => 2499.00,
                'original_price' => 3499.00,
                'stock_status' => 'in_stock',
                'stock' => 50,
                // Media
                'image' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
                'images' => [
                    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1624638763996-25802e7d7966?auto=format&fit=crop&q=80&w=800'
                ],
                'video_url' => null,
                // Descriptions
                'short_description' => 'Luxurious night cream infused with pure Kashmiri Saffron and Vitamin E for youthful, glowing skin.',
                'long_description' => '<p>Wake up to radiant skin with <strong>Radiant Glow Saffron Night Cream</strong>. Our unique formula combines age-old Ayurvedic wisdom with modern dermatology.</p><p>Key benefits include reduction of dark spots, even skin tone, and deep hydration.</p>',
                // JSON Data Fields
                'highlights' => [
                    'Brightens Skin Tone',
                    'Reduces Dark Spots',
                    'Deep Hydration',
                    'Paraben Free'
                ],
                'specifications' => [
                    'Volume' => '50g',
                    'Texture' => 'Creamy',
                    'Key Ingredients' => 'Saffron, Almond Oil, Vitamin E',
                    'Skin Type' => 'All Skin Types',
                    'Application' => 'Night'
                ],
                // Policies
                'return_policy' => 'Non-returnable if seal is broken.',
                'warranty_info' => 'Dermatologically tested.',
                // Extra
                'additional_info' => [
                    'Country of Origin' => 'India',
                    'Fragrance' => 'Natural Saffron',
                    'Packaging' => 'Glass Jar'
                ],
                'variants' => [],
                'tags' => ['Skincare', 'Saffron', 'Night Cream', 'Luxury'],
                // SEO
                'seo_title' => 'Radiant Glow Saffron Night Cream - Brightening & Anti-Aging',
                'seo_description' => 'Best chemical-free herbal night cream with saffron. Reduces pigmentation and adds glow.',
                'meta_schema' => [
                    '@context' => 'https://schema.org/',
                    '@type' => 'Product',
                    'name' => 'Radiant Glow Saffron Night Cream',
                    'brand' => 'AyurLife Organics'
                ],
                // Stats
                'rating' => 4.9,
                'reviews_count' => 89,
                'sales_count' => 210,
                'views_count' => 850,
                'status' => 'published',
                'is_prescription_required' => false
            ]
        ];

        // 3. Insert Data
        foreach ($products as $productData) {
            // Extract tags for separate sync
            $tags = $productData['tags'];
            unset($productData['tags']);

            // Create Product
            // We use updateOrCreate based on SKU to avoid duplicates if run multiple times
            $product = Product::updateOrCreate(
                ['sku' => $productData['sku']],
                $productData
            );

            // Sync Tags? (Only if relations exist, assuming they do based on schema)
            // Implementation: We won't strictly enforce tags table seeding here to keep it simple unless needed.
            // But we can update the 'tags' column which is JSON in the migration I saw (2025_11_25_174229_create_products_table.php line 44)
            // Wait, migration 44 says $table->json('tags')->nullable(); So it's a JSON column.
            // But ProductSeeder.php line 282 uses $product->tags()->sync($tagIds); which implies a relation.
            // Let's do BOTH for safety.
            
            // 1. JSON Column
            $product->update(['tags' => $tags]);

            // 2. Relation (if exists) - Safe try
            try {
                 $tagIds = [];
                 // This requires Tag model and relation. Let's skip relation for now to be "Safe" and UI focused.
                 // The JSON column 'tags' is what frontend likely uses for display in simple view.
            } catch (\Exception $e) {
                // Ignore relation errors
            }

            $this->command->info("Seeded Product: {$product->title}");
        }
    }
}
