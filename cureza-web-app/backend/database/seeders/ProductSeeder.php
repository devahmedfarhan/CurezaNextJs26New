<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Product::truncate();
        // Optionally truncate pivot tables if needed, but standard truncate on product might fail if constraints are active
        // Ideally we should truncate product_attribute_values, wishlists, reviews, etc. as well if we are hardcore cleaning.
        // But for now, let's stick to Product.
        Schema::enableForeignKeyConstraints();

        $seller = User::where('email', 'seller@cureza.com')->first();

        if (!$seller) {
            // Create seller if missing (failsafe)
            $seller = User::create([
                'name' => 'AyurLife Organics',
                'email' => 'seller@cureza.com',
                'password' => bcrypt('password'),
                'role' => 'vendor',
                'phone' => '9876543211',
                'email_verified_at' => now(),
            ]);
        }

        // --- 1. SETUP CATEGORIES ---
        $latestLaunch = Category::firstOrCreate(
            ['slug' => 'latest-launch'],
            ['name' => 'Latest Launch', 'type' => 'category', 'is_active' => true]
        );

        $ayurveda = Category::firstOrCreate(
            ['slug' => 'ayurveda'],
            ['name' => 'Ayurveda', 'type' => 'category', 'is_active' => true]
        );

        $wellness = Category::firstOrCreate(
            ['slug' => 'wellness'],
            ['name' => 'Wellness', 'type' => 'category', 'is_active' => true]
        );

        $supplements = Category::firstOrCreate(
            ['slug' => 'supplements'],
            ['name' => 'Supplements', 'type' => 'category', 'is_active' => true]
        );

        $personalCare = Category::firstOrCreate(
            ['slug' => 'personal-care'],
            ['name' => 'Personal Care', 'type' => 'category', 'is_active' => true]
        );

        // --- 2. SETUP BRANDS ---
        $auraWellness = Brand::where('slug', 'aura-wellness')->first();
        if (!$auraWellness) {
            $auraWellnessSeller = User::firstOrCreate(
                ['email' => 'aurawellness@cureza-seller.com'],
                [
                    'name' => 'Aura Wellness',
                    'password' => bcrypt('password123'),
                    'role' => 'vendor',
                    'email_verified_at' => now(),
                ]
            );
            $auraWellness = Brand::create([
                'slug' => 'aura-wellness',
                'name' => 'Aura Wellness',
                'is_active' => true,
                'user_id' => $auraWellnessSeller->id,
            ]);
        }
        $noelleRosa = $auraWellness;
        $greenEarth = $auraWellness;

        $productsData = [
            // --- NOELLE ROSA (User Request) ---
            [
                'title' => 'Radiance Boost Face Cream',
                'brand_id' => $noelleRosa->id,
                'price' => 898,
                'original_price' => 9999, // As per screenshot hint "9999" -> 898
                'rating' => 5.0,
                'reviews_count' => 0,
                'sales_count' => 10,
                'image' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Premium wellness product crafted for daily balance & results.',
                'long_description' => 'Experience the luxury of Noelle Rosa\'s Radiance Boost Face Cream. Enriched with rare botanicals and antioxidants, this cream deeply hydrates and revitalizes your skin, leaving it with a natural, healthy glow. Suitable for all skin types.',
                'category_id' => $latestLaunch->id,
                'stock' => 50,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Latest Launch', 'Skin Care', 'Premium']
            ],
            [
                'title' => 'Calm & Focus CBD Oil',
                'brand_id' => $noelleRosa->id,
                'price' => 899,
                'original_price' => 999,
                'rating' => 4.5,
                'reviews_count' => 0,
                'sales_count' => 5,
                'image' => 'https://images.unsplash.com/photo-1624638763996-25802e7d7966?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1624638763996-25802e7d7966?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Premium wellness product crafted for daily balance & results.',
                'long_description' => 'Find your balance with Noelle Rosa\'s Calm & Focus CBD Oil. Sourced from organically grown hemp, this full-spectrum oil helps alleviate stress, improve focus, and promote a sense of calm without drowsiness.',
                'category_id' => $latestLaunch->id,
                'stock' => 100,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Latest Launch', 'CBD', 'Relaxation']
            ],
            [
                'title' => 'Revitalizing Night Serum',
                'brand_id' => $noelleRosa->id,
                'price' => 899, // User suggested roughly same range
                'original_price' => 1299,
                'rating' => 4.8,
                'reviews_count' => 12,
                'sales_count' => 40,
                'image' => 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Advanced night repair serum for youthful skin.',
                'long_description' => 'Wake up to rejuvenated skin with our Revitalizing Night Serum. Formulated with Retinol and Hyaluronic Acid, it works overnight to reduce fine lines, smooth texture, and plump your skin for a youthful appearance.',
                'category_id' => $latestLaunch->id,
                'stock' => 80,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Latest Launch', 'Anti-aging']
            ],

            // --- GREEN EARTH (Originals) ---
            [
                'title' => 'Organic Ashwagandha Powder',
                'brand_id' => $greenEarth->id,
                'price' => 450,
                'original_price' => 550,
                'rating' => 4.8,
                'reviews_count' => 150,
                'image' => 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Pure organic Ashwagandha root powder.',
                'long_description' => 'Pure organic Ashwagandha root powder for stress relief and vitality. Sourced from certified organic farms.',
                'category_id' => $ayurveda->id,
                'stock' => 100,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Bestseller', 'Stress']
            ],
            [
                'title' => 'Triphala Juice',
                'brand_id' => $greenEarth->id,
                'price' => 299,
                'original_price' => 399,
                'rating' => 4.5,
                'reviews_count' => 85,
                'image' => 'https://images.unsplash.com/photo-1626420981987-9b2c8c6d1d2b?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1626420981987-9b2c8c6d1d2b?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Blend of Amla, Haritaki, and Bibhitaki.',
                'long_description' => 'A powerful blend of Amla, Haritaki, and Bibhitaki for digestive health and detoxification.',
                'category_id' => $wellness->id,
                'stock' => 80,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Natural', 'Detox']
            ],
            [
                'title' => 'Brahmi Capsules',
                'brand_id' => $greenEarth->id,
                'price' => 599,
                'original_price' => 799,
                'rating' => 4.7,
                'reviews_count' => 60,
                'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Enhance memory and cognitive function.',
                'long_description' => 'Enhance memory and cognitive function with our potent Brahmi extract capsules.',
                'category_id' => $supplements->id,
                'stock' => 120,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Brain Health', 'Focus']
            ],
            [
                'title' => 'Cold Pressed Neem Oil',
                'brand_id' => $greenEarth->id,
                'price' => 250,
                'original_price' => 300,
                'rating' => 4.6,
                'reviews_count' => 95,
                'image' => 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Pure Neem oil for healthy skin and hair.',
                'long_description' => 'Pure Neem oil for healthy skin and hair. Natural antifungal and antibacterial properties.',
                'category_id' => $personalCare->id,
                'stock' => 200,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Skin Care', 'Natural']
            ],
            [
                'title' => 'Organic Amla Powder',
                'brand_id' => $greenEarth->id,
                'price' => 199,
                'original_price' => 299,
                'rating' => 4.4,
                'reviews_count' => 75,
                'image' => 'https://images.unsplash.com/photo-1607006412366-042735d49d3e?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1607006412366-042735d49d3e?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1596590925727-9b952726f946?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Rich source of natural Vitamin C.',
                'long_description' => 'Rich source of natural Vitamin C. Boosts immunity and promotes healthy hair.',
                'category_id' => $ayurveda->id,
                'stock' => 300,
                'status' => 'published',
                'stock_status' => 'in_stock',
                'tags' => ['Vitamin C', 'Immunity']
            ],
             [ // Giloy Guduchi Tablets
                'title' => 'Giloy Guduchi Tablets',
                'brand_id' => $greenEarth->id,
                'price' => 399,
                'original_price' => 499,
                'rating' => 4.7,
                'reviews_count' => 110,
                'image' => 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500',
                'images' => [
                    'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=500'
                ],
                'short_description' => 'Boost your immunity naturally.',
                'long_description' => 'Boost your immunity naturally with Giloy tablets. Helps fight infections and fever.',
                'category_id' => $supplements->id,
                'stock' => 180,
                'status' => 'published',
                'status' => 'approved', // Keeping 'approved' as well for safety if backend uses it
                'stock_status' => 'in_stock',
                'tags' => ['Immunity', 'Herbal']
            ]
        ];
        foreach ($productsData as $productData) {
            $tags = $productData['tags'] ?? [];
            unset($productData['tags']);

            $brand = Brand::find($productData['brand_id']);
            $productSellerId = $brand ? $brand->user_id : $seller->id;
            $product = Product::create(array_merge($productData, ['seller_id' => $productSellerId]));

            // Sync Tags
            if (!empty($tags)) {
                $tagIds = [];
                foreach ($tags as $tagName) {
                    $tag = Tag::firstOrCreate(
                        ['slug' => Str::slug($tagName)],
                        ['name' => $tagName]
                    );
                    $tagIds[] = $tag->id;
                }
                $product->tags()->sync($tagIds);
            }
        }
    }
}
