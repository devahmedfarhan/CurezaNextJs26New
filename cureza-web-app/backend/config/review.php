<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Review System Configuration
    |--------------------------------------------------------------------------
    */

    // Seller overall rating weights (must sum to 1.0)
    'product_weight' => env('REVIEW_PRODUCT_WEIGHT', 0.7), // 70%
    'brand_weight' => env('REVIEW_BRAND_WEIGHT', 0.3),     // 30%

    // Review moderation
    'auto_approve' => env('REVIEW_AUTO_APPROVE', true),
    'require_verification' => env('REVIEW_REQUIRE_VERIFICATION', true),

    // Media uploads
    'allow_media' => true,
    'max_images' => 5,
    'max_videos' => 1,
    'max_file_size' => 10240, // KB (10MB)

    // Editing
    'allow_customer_edit' => false,
    'edit_window_hours' => 0, // 0 = no editing allowed

    // Display
    'reviews_per_page' => 10,
    'default_sort' => 'newest', // newest, highest, lowest, helpful

    // Cache
    'cache_duration' => 300, // seconds (5 minutes)
];
