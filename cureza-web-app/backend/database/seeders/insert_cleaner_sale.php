<?php

use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Product;
use App\Models\Coupon;
use Carbon\Carbon;

// Check if we are running in Laravel environment, if not, bootstrap it.
if (!defined('LARAVEL_START')) {
    require __DIR__ . '/../../vendor/autoload.php';
    $app = require_once __DIR__ . '/../../bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
}

echo "Starting Cleaner Sale setup...\n";

// 1. Create or Update Coupon: CLEANERSALE
$coupon = Coupon::updateOrCreate(
    ['code' => 'CLEANERSALE'],
    [
        'type' => 'percent',
        'value' => 20.00,
        'min_cart_value' => 499.00,
        'expires_at' => Carbon::now()->addMonth(),
        'is_active' => true,
    ]
);
echo "Coupon 'CLEANERSALE' created/updated successfully.\n";

// 2. Activate Liver & Kidney Detox category
$category = Category::where('slug', 'liver-kidney-detox')->first();
if ($category) {
    $category->is_active = true;
    $category->save();
    echo "Category 'Liver & Kidney Detox' activated.\n";
} else {
    // Create it if it doesn't exist
    $category = Category::create([
        'name' => 'Liver & Kidney Detox',
        'slug' => 'liver-kidney-detox',
        'type' => 'concern',
        'icon' => '🫘',
        'description' => 'Detoxification and cleansing products for liver and kidney health.',
        'is_active' => true,
        'show_in_mega_menu' => true
    ]);
    echo "Category 'Liver & Kidney Detox' created and activated.\n";
}

// 3. Find a seller to associate with the products
$sellerId = DB::table('seller_profiles')->value('user_id') ?: 1;
echo "Using seller_id: $sellerId\n";

// 4. Seed 4 premium detox products
$detoxProducts = [
    [
        'title' => 'Cureza Organic Triphala Colon Cleanse',
        'slug' => 'cureza-organic-triphala-colon-cleanse-detox',
        'price' => 449.00,
        'original_price' => 599.00,
        'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
        'short_description' => 'Standardized Ayurvedic extracts of Amla, Haritaki, and Bibhitaki for gentle colon cleanse and digestion.',
        'long_description' => 'Triphala is a time-tested Ayurvedic formulation comprising three powerful fruits. It helps flush out toxins from the digestive tract, regulates bowel movements, and promotes overall wellness.',
    ],
    [
        'title' => 'Cureza Neem Blood Purifier & Skin Detox',
        'slug' => 'cureza-neem-blood-purifier-skin-detox',
        'price' => 379.00,
        'original_price' => 499.00,
        'image' => 'https://images.unsplash.com/photo-1607619056574-7b8f304f3c6f?auto=format&fit=crop&q=80&w=600',
        'short_description' => 'Natural neem blood purifying capsules to purge toxins, improve liver function, and support clear skin.',
        'long_description' => 'Formulated with organic Neem extracts, this supplement acts as a premier blood purifier. It cleanses the liver, fights acne-causing bacteria, and reduces skin redness and inflammation from within.',
    ],
    [
        'title' => 'Cureza Liver Care & Kidney Detox Syrup',
        'slug' => 'cureza-liver-care-kidney-detox-syrup',
        'price' => 549.00,
        'original_price' => 699.00,
        'image' => 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600',
        'short_description' => 'Synergistic herbal syrup designed to support optimal liver and kidney detoxification and health.',
        'long_description' => 'A potent liquid formulation that combines Bhumi Amla, Punarnava, and Milk Thistle. It assists in cellular regeneration, improves bile secretion, and protects liver-kidney tissue integrity against oxidative damage.',
    ],
    [
        'title' => 'Cureza Activated Charcoal Facial Cleanser',
        'slug' => 'cureza-activated-charcoal-facial-cleanser',
        'price' => 299.00,
        'original_price' => 399.00,
        'image' => 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600',
        'short_description' => 'Deep pore cleansing face wash with activated bamboo charcoal and botanical extracts.',
        'long_description' => 'This facial cleanser acts like a magnet, drawing out oil, dirt, and impurities from deep within pores. Infused with tea tree and aloe vera, it calms the skin while keeping it balanced and glowing.',
    ],
];

foreach ($detoxProducts as $data) {
    Product::updateOrCreate(
        ['slug' => $data['slug']],
        [
            'title' => $data['title'],
            'price' => $data['price'],
            'original_price' => $data['original_price'],
            'image' => $data['image'],
            'short_description' => $data['short_description'],
            'long_description' => $data['long_description'],
            'category_id' => $category->id,
            'seller_id' => $sellerId,
            'status' => 'published',
            'stock_status' => 'in_stock',
            'stock' => 120,
            'is_new_arrival' => true,
        ]
    );
    echo "Product '{$data['title']}' created/updated.\n";
}

echo "Cleaner Sale setup complete!\n";
