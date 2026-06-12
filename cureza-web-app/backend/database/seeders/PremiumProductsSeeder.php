<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Support\Str;

class PremiumProductsSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'title' => "Hemp Seed Oil for Anxiety Relief",
                'brand' => "India Hemp Organics",
                'category' => "Oils",
                'tags' => ["Anxiety", "Sleep", "Organic"],
                'price' => 1499,
                'original_price' => 2499,
                'rating' => 4.8,
                'reviews_count' => 124,
                'sales_count' => 450,
                'description' => "Pure, organic hemp seed oil to help you find your calm and improve sleep quality naturally.",
                'image' => "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=1887&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Ayurvedic Ashwagandha Gummies",
                'brand' => "Kapiva",
                'category' => "Gummies",
                'tags' => ["Stress", "Energy", "Ayurveda"],
                'price' => 599,
                'original_price' => 799,
                'rating' => 4.7,
                'reviews_count' => 89,
                'sales_count' => 800,
                'description' => "Delicious gummies infused with Ashwagandha to reduce stress and boost daily energy.",
                'image' => "https://images.unsplash.com/photo-1624638763996-25802e7d7966?q=80&w=1887&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1624638763996-25802e7d7966?q=80&w=1887&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1565060169680-ba6df626027e?q=80&w=1886&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Kumkumadi Tailam Face Oil",
                'brand' => "Kama Ayurveda",
                'category' => "Skin Care",
                'tags' => ["Glow", "Anti-aging", "Saffron"],
                'price' => 2895,
                'original_price' => 3295,
                'rating' => 4.9,
                'reviews_count' => 312,
                'sales_count' => 1200,
                'description' => "Miraculous beauty fluid with saffron to brighten skin and reduce signs of aging.",
                'image' => "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=1920&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=1920&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=1887&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "CBD Pain Relief Balm",
                'brand' => "Boheco",
                'category' => "CBD",
                'tags' => ["Pain", "Muscle Recovery", "CBD"],
                'price' => 850,
                'original_price' => 1200,
                'rating' => 4.6,
                'reviews_count' => 56,
                'sales_count' => 230,
                'description' => "Fast-acting CBD balm for muscle soreness and joint pain relief.",
                'image' => "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=1887&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=1887&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Herbal Hair Growth Oil",
                'brand' => "Indulekha",
                'category' => "Personal Care",
                'tags' => ["Hair Growth", "Herbal", "Anti-fall"],
                'price' => 430,
                'original_price' => 550,
                'rating' => 4.5,
                'reviews_count' => 450,
                'sales_count' => 1500,
                'description' => "Clinically proven herbal oil to reduce hair fall and stimulate new hair growth.",
                'image' => "https://images.unsplash.com/photo-1598440947619-2c35fc9b0717?q=80&w=1887&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1598440947619-2c35fc9b0717?q=80&w=1887&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1556228720-1957be83f344?q=80&w=1887&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Vitamin C Face Serum",
                'brand' => "Minimalist",
                'category' => "Skin Care",
                'tags' => ["Brightening", "Vitamin C", "Serum"],
                'price' => 699,
                'original_price' => 799,
                'rating' => 4.8,
                'reviews_count' => 210,
                'sales_count' => 950,
                'description' => "High potency Vitamin C serum for glowing, even-toned skin.",
                'image' => "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=1887&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=1887&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=1920&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Sleep Well Melatonin Strips",
                'brand' => "Wellbeing Nutrition",
                'category' => "Wellness",
                'tags' => ["Sleep", "Melatonin", "Instant"],
                'price' => 499,
                'original_price' => 650,
                'rating' => 4.6,
                'reviews_count' => 78,
                'sales_count' => 300,
                'description' => "Dissolving strips for instant sleep support and jet lag relief.",
                'image' => "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1860&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1860&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1550572017-edd951aa8f72?q=80&w=1974&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Organic Green Tea",
                'brand' => "Organic India",
                'category' => "Herbal",
                'tags' => ["Detox", "Antioxidant", "Tea"],
                'price' => 240,
                'original_price' => 290,
                'rating' => 4.7,
                'reviews_count' => 560,
                'sales_count' => 2000,
                'description' => "Rich in antioxidants, this green tea helps in detox and weight management.",
                'image' => "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=1887&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=1887&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1888&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Biotin Hair Gummies",
                'brand' => "Power Gummies",
                'category' => "Gummies",
                'tags' => ["Hair", "Nails", "Tasty"],
                'price' => 999,
                'original_price' => 1299,
                'rating' => 4.5,
                'reviews_count' => 150,
                'sales_count' => 600,
                'description' => "Chewable vitamins for stronger hair and nails with a delicious taste.",
                'image' => "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1887&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1887&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1624638763996-25802e7d7966?q=80&w=1887&auto=format&fit=crop"
                ],
            ],
            [
                'title' => "Lavender Essential Oil",
                'brand' => "Soulflower",
                'category' => "Oils",
                'tags' => ["Relaxation", "Aroma", "Pure"],
                'price' => 350,
                'original_price' => 450,
                'rating' => 4.8,
                'reviews_count' => 90,
                'sales_count' => 400,
                'description' => "100% pure lavender oil for aromatherapy and relaxation.",
                'image' => "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1953&auto=format&fit=crop",
                'images' => [
                    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1953&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=1920&auto=format&fit=crop"
                ],
            ]
        ];

        foreach ($products as $productData) {
            // 1. Find or Create Brand
            $brand = Brand::firstOrCreate(
                ['slug' => Str::slug($productData['brand'])],
                ['name' => $productData['brand']]
            );

            // 2. Find or Create Category
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($productData['category'])],
                ['name' => $productData['category'], 'type' => 'category']
            );

            // 3. Create Product
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($productData['title'])], // Check by slug to avoid duplicates
                [
                    'title' => $productData['title'],
                    'brand_id' => $brand->id,
                    'category_id' => $category->id,
                    'price' => $productData['price'],
                    'original_price' => $productData['original_price'],
                    'rating' => $productData['rating'],
                    'reviews_count' => $productData['reviews_count'],
                    'sales_count' => $productData['sales_count'],
                    'short_description' => Str::limit($productData['description'], 150),
                    'long_description' => $productData['description'],
                    'image' => $productData['image'],
                    'images' => $productData['images'], // Casts to JSON automatically
                    'status' => 'published',
                    'stock_status' => 'in_stock',
                    'stock' => 100,
                ]
            );

            // 4. Sync Tags
            if (isset($productData['tags'])) {
                $tagIds = [];
                foreach ($productData['tags'] as $tagName) {
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
