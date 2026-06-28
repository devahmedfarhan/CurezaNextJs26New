<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/seed-aura-reviews', function () {
    $brand = \App\Models\Brand::where('slug', 'aura-wellness')->first();
    if (!$brand) return "Brand aura-wellness not found";
    
    $sellerId = $brand->user_id;
    
    // Create some fake customers or use existing ones
    $customerIds = \App\Models\User::where('role', 'customer')->pluck('id')->toArray();
    if (empty($customerIds)) {
        // Fallback: create a dummy customer user
        $customer = \App\Models\User::create([
            'name' => 'John Doe',
            'email' => 'customer_demo_' . rand(100, 999) . '@cureza.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
        $customerIds = [$customer->id];
    }
    
    $reviewsData = [
        ['rating' => 5, 'text' => 'Absolutely love Aura Wellness products! Their quality is consistent, and the organic formulas feel extremely premium.'],
        ['rating' => 5, 'text' => 'Highly recommended! Fast shipping and the packaging was beautiful.'],
        ['rating' => 4, 'text' => 'The wellness range has really helped my digestion. Will purchase again.'],
        ['rating' => 5, 'text' => 'Pure and authentic ingredients. Cureza is doing a great job bringing such brands forward!'],
        ['rating' => 5, 'text' => 'Amazing customer support and genuine Ayurvedic extracts. Recommended 100%.'],
        ['rating' => 4, 'text' => 'Good value for money. Very effective herbal capsules.'],
        ['rating' => 5, 'text' => 'The brand values purity and it shows in the results. Love their products.'],
        ['rating' => 4, 'text' => 'Very satisfied with the quality of Aura Wellness. Packaging could be slightly improved.'],
        ['rating' => 5, 'text' => 'Outstanding quality. Been using their dietary supplements for a month now.'],
        ['rating' => 5, 'text' => 'Best Ayurvedic brand on the platform. True to their claim of being organic.'],
        ['rating' => 5, 'text' => 'Excellent wellness blends! Very smooth on the stomach.'],
        ['rating' => 4, 'text' => 'My skin looks and feels healthier after using their herbal juices.'],
        ['rating' => 5, 'text' => 'Simply the best organic extracts I have found online.'],
        ['rating' => 5, 'text' => 'Super fast delivery and great quality control. Extremely happy.'],
        ['rating' => 4, 'text' => 'The flavor is very natural. No artificial additives.'],
        ['rating' => 5, 'text' => 'Wonderful products. Strongly recommend to anyone looking for genuine wellness.'],
    ];

    $count = 0;
    foreach ($reviewsData as $data) {
        $exists = \App\Models\Review::where('seller_id', $sellerId)
            ->where('review_text', $data['text'])
            ->exists();
        if (!$exists) {
            \App\Models\Review::create([
                'customer_id' => null,
                'seller_id' => $sellerId,
                'review_type' => 'seller',
                'rating' => $data['rating'],
                'review_text' => $data['text'],
                'status' => 'active',
                'reviewed_at' => now()->subDays(rand(1, 30)),
                'full_name' => 'Demo Customer',
                'email' => 'demo_customer@cureza.com',
            ]);
            $count++;
        }
    }

    $total = \App\Models\Review::where('seller_id', $sellerId)->count();
    return "Successfully seeded {$count} reviews for Aura Wellness! Total existing in DB: {$total}";
});



