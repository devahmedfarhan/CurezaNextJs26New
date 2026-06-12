<?php

namespace App\Services;

use App\Models\Review;
use App\Models\ReviewMedia;
use App\Models\RatingAggregate;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class ReviewService
{
    /**
     * Create a product review
     */
    public function createProductReview($customerId, $productId, $orderId, $rating, $reviewText = null, $mediaFiles = [])
    {
        // Verify customer can review this product
        $this->verifyPurchase($customerId, $productId, $orderId);

        // Check for duplicate review
        if ($this->hasReviewed($customerId, $productId, $orderId)) {
            throw new \Exception('You have already reviewed this product for this order.');
        }

        // Get seller ID from product
        $product = Product::findOrFail($productId);
        $sellerId = $product->seller_id;

        // Get customer details
        $customer = User::findOrFail($customerId);

        DB::beginTransaction();
        try {
            // Create review
            $review = Review::create([
                'customer_id' => $customerId,
                'seller_id' => $sellerId,
                'product_id' => $productId,
                'order_id' => $orderId,
                'review_type' => 'product',
                'rating' => $rating,
                'review_text' => $reviewText,
                'full_name' => $customer->name,
                'email' => $customer->email,
                'status' => 'pending',
                'reviewed_at' => now(),
            ]);

            // Handle media uploads
            if (!empty($mediaFiles)) {
                $this->uploadReviewMedia($review->id, $mediaFiles);
            }

            // Recalculate product rating
            $this->calculateProductRating($productId);

            // Recalculate seller rating (includes product ratings)
            $this->calculateSellerRating($sellerId);

            DB::commit();

            return $review->load(['customer', 'product', 'mediaItems']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create a seller/brand review
     */
    public function createSellerReview($customerId, $sellerId, $orderId = null, $rating, $reviewText = null, $fullName = null, $email = null)
    {
        // Verify customer interaction with seller
        if ($orderId) {
            $this->verifyOrder($customerId, $sellerId, $orderId);
            
            // Check for duplicate review for this specific order
            if ($this->hasReviewedSeller($customerId, $sellerId, $orderId)) {
                throw new \Exception('You have already reviewed this seller for this order.');
            }
        } else {
            // General seller review - verify at least one purchase exists
            $this->verifyVerifiedBuyer($customerId, $sellerId);
            
            // Check for duplicate general review (limit 1 general review per seller per customer? or rate limit?)
            // For now, let's limit 1 active general review per customer per seller
            $hasGeneralReview = Review::where('customer_id', $customerId)
                ->where('seller_id', $sellerId)
                ->where('review_type', 'seller')
                ->whereNull('order_id')
                ->whereNull('product_id')
                ->exists();
                
            if ($hasGeneralReview) {
                 throw new \Exception('You have already submitted a general review for this seller.');
            }
        }

        // Get customer details
        $customer = User::findOrFail($customerId);

        DB::beginTransaction();
        try {
            // Create review
            $review = Review::create([
                'customer_id' => $customerId,
                'seller_id' => $sellerId,
                'product_id' => null,
                'order_id' => $orderId,
                'review_type' => 'seller',
                'rating' => $rating,
                'review_text' => $reviewText,
                'full_name' => $fullName ?? $customer->name,
                'email' => $email ?? $customer->email,
                'status' => 'pending',
                'reviewed_at' => now(),
            ]);

            // Recalculate seller rating
            $this->calculateSellerRating($sellerId);

            DB::commit();

            return $review->load(['customer', 'seller']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create a doctor review
     */
    public function createDoctorReview($customerId, $doctorId, $rating, $reviewText = null)
    {
        // Verify customer has a prescription or appointment with the doctor
        $hasPrescription = \App\Models\Prescription::where('user_id', $customerId)
            ->where('doctor_id', $doctorId)
            ->exists();

        $hasAppointment = \App\Models\Appointment::where('user_id', $customerId)
            ->where('doctor_id', $doctorId)
            ->where('status', 'completed')
            ->exists();

        if (!$hasPrescription && !$hasAppointment) {
            throw new \Exception('You must have a completed consultation with this doctor to write a review.');
        }

        // Check for duplicate doctor review (limit 1 active review per doctor per customer)
        $hasExisting = Review::where('customer_id', $customerId)
            ->where('seller_id', $doctorId)
            ->where('review_type', 'seller')
            ->whereNull('product_id')
            ->whereNull('order_id')
            ->exists();

        if ($hasExisting) {
            throw new \Exception('You have already submitted a review for this doctor.');
        }

        $customer = User::findOrFail($customerId);

        DB::beginTransaction();
        try {
            // Create review with 'seller' type to conform to database enum constraint
            $review = Review::create([
                'customer_id' => $customerId,
                'seller_id' => $doctorId,
                'product_id' => null,
                'order_id' => null,
                'review_type' => 'seller',
                'rating' => $rating,
                'review_text' => $reviewText,
                'full_name' => $customer->name,
                'email' => $customer->email,
                'status' => 'pending', // Awaiting superadmin moderation
                'reviewed_at' => now(),
            ]);

            // Recalculate doctor rating
            $this->calculateSellerRating($doctorId);

            DB::commit();

            return $review->load(['customer', 'seller']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Calculate product rating and update aggregate table
     */
    public function calculateProductRating($productId)
    {
        $reviews = Review::active()
            ->product()
            ->where('product_id', $productId)
            ->get();

        $totalReviews = $reviews->count();
        $averageRating = $totalReviews > 0 ? round($reviews->avg('rating'), 2) : 0;

        // Count by rating level
        $ratingCounts = [
            1 => $reviews->where('rating', 1)->count(),
            2 => $reviews->where('rating', 2)->count(),
            3 => $reviews->where('rating', 3)->count(),
            4 => $reviews->where('rating', 4)->count(),
            5 => $reviews->where('rating', 5)->count(),
        ];

        // Update or create aggregate
        RatingAggregate::updateOrCreate(
            [
                'aggregatable_type' => 'App\\Models\\Product',
                'aggregatable_id' => $productId,
            ],
            [
                'average_rating' => $averageRating,
                'total_reviews' => $totalReviews,
                'rating_1_count' => $ratingCounts[1],
                'rating_2_count' => $ratingCounts[2],
                'rating_3_count' => $ratingCounts[3],
                'rating_4_count' => $ratingCounts[4],
                'rating_5_count' => $ratingCounts[5],
                'last_calculated_at' => now(),
            ]
        );

        // Update Product Model stats (for simple access)
        Product::where('id', $productId)->update([
            'rating' => $averageRating,
            'reviews_count' => $totalReviews
        ]);

        // Clear cache
        Cache::forget("product_rating_{$productId}");

        return [
            'average' => $averageRating,
            'total' => $totalReviews,
            'breakdown' => $ratingCounts,
        ];
    }

    /**
     * Calculate seller overall rating using weighted formula
     */
    public function calculateSellerRating($sellerId)
    {
        // Get weights from config (default: 70% product, 30% brand)
        $productWeight = config('review.product_weight', 0.7);
        $brandWeight = config('review.brand_weight', 0.3);

        // Get all product reviews for seller's products
        $productReviews = Review::active()
            ->product()
            ->where('seller_id', $sellerId)
            ->get();

        $productAvg = $productReviews->count() > 0 ? $productReviews->avg('rating') : 0;
        $productCount = $productReviews->count();

        // Get all seller/brand reviews
        $sellerReviews = Review::active()
            ->seller()
            ->where('seller_id', $sellerId)
            ->whereNull('product_id')
            ->get();

        $sellerAvg = $sellerReviews->count() > 0 ? $sellerReviews->avg('rating') : 0;
        $sellerCount = $sellerReviews->count();

        // Calculate weighted average
        $overallRating = 0;
        if ($productCount > 0 && $sellerCount > 0) {
            // Both types exist - use weighted formula
            $overallRating = ($productAvg * $productWeight) + ($sellerAvg * $brandWeight);
        } elseif ($productCount > 0) {
            // Only product reviews exist
            $overallRating = $productAvg;
        } elseif ($sellerCount > 0) {
            // Only seller reviews exist
            $overallRating = $sellerAvg;
        }

        $overallRating = round($overallRating, 2);
        $totalReviews = $productCount + $sellerCount;

        // Combine rating counts from both sources
        $allReviews = $productReviews->merge($sellerReviews);
        $ratingCounts = [
            1 => $allReviews->where('rating', 1)->count(),
            2 => $allReviews->where('rating', 2)->count(),
            3 => $allReviews->where('rating', 3)->count(),
            4 => $allReviews->where('rating', 4)->count(),
            5 => $allReviews->where('rating', 5)->count(),
        ];

        // Update or create aggregate
        RatingAggregate::updateOrCreate(
            [
                'aggregatable_type' => 'App\\Models\\User',
                'aggregatable_id' => $sellerId,
            ],
            [
                'average_rating' => $overallRating,
                'total_reviews' => $totalReviews,
                'rating_1_count' => $ratingCounts[1],
                'rating_2_count' => $ratingCounts[2],
                'rating_3_count' => $ratingCounts[3],
                'rating_4_count' => $ratingCounts[4],
                'rating_5_count' => $ratingCounts[5],
                'last_calculated_at' => now(),
            ]
        );

        // Clear cache
        Cache::forget("seller_rating_{$sellerId}");

        return [
            'average' => $overallRating,
            'total' => $totalReviews,
            'product_average' => round($productAvg, 2),
            'brand_average' => round($sellerAvg, 2),
            'breakdown' => $ratingCounts,
        ];
    }

    /**
     * Verify customer purchased the product in the order
     */
    public function verifyPurchase($customerId, $productId, $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $customerId)
            ->whereIn('status', ['delivered', 'completed', 'received'])
            ->first();

        if (!$order) {
            throw new \Exception('Order not found or not delivered yet.');
        }

        $orderItem = OrderItem::where('order_id', $orderId)
            ->where('product_id', $productId)
            ->first();

        if (!$orderItem) {
            throw new \Exception('Product not found in this order.');
        }

        return true;
    }

    /**
     * Verify customer has an order with the seller
     */
    public function verifyOrder($customerId, $sellerId, $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $customerId)
            ->whereIn('status', ['delivered', 'completed'])
            ->first();

        if (!$order) {
            throw new \Exception('Order not found or not delivered yet.');
        }

        // Check if order has items from this seller
        $hasSellerItems = OrderItem::where('order_id', $orderId)
            ->whereHas('product', function ($query) use ($sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->exists();

        if (!$hasSellerItems) {
            throw new \Exception('This order does not contain products from this seller.');
        }

        return true;
    }

    /**
     * Check if customer already reviewed this product for this order
     */
    public function hasReviewed($customerId, $productId, $orderId)
    {
        return Review::where('customer_id', $customerId)
            ->where('product_id', $productId)
            ->where('order_id', $orderId)
            ->exists();
    }

    /**
     * Check if customer already reviewed this seller for this order
     */
    public function hasReviewedSeller($customerId, $sellerId, $orderId)
    {
        return Review::where('customer_id', $customerId)
            ->where('seller_id', $sellerId)
            ->where('order_id', $orderId)
            ->where('review_type', 'seller')
            ->whereNull('product_id')
            ->exists();
    }

    /**
     * Upload review media files
     */
    protected function uploadReviewMedia($reviewId, $mediaFiles)
    {
        $order = 0;
        foreach ($mediaFiles as $file) {
            $mediaType = str_starts_with($file->getMimeType(), 'image/') ? 'image' : 'video';
            
            // Store file
            $path = $file->store('reviews', 'public');
            
            // Generate thumbnail for videos
            $thumbnailPath = null;
            if ($mediaType === 'video') {
                // TODO: Implement video thumbnail generation
                // $thumbnailPath = $this->generateVideoThumbnail($path);
            }

            ReviewMedia::create([
                'review_id' => $reviewId,
                'media_type' => $mediaType,
                'media_path' => $path,
                'thumbnail_path' => $thumbnailPath,
                'display_order' => $order++,
            ]);
        }
    }

    /**
     * Get cached product rating
     */
    public function getProductRating($productId)
    {
        return Cache::remember("product_rating_{$productId}", 300, function () use ($productId) {
            $aggregate = RatingAggregate::forProduct($productId)->first();
            
            if (!$aggregate) {
                $this->calculateProductRating($productId);
                $aggregate = RatingAggregate::forProduct($productId)->first();
            }

            return $aggregate;
        });
    }

    /**
     * Get cached seller rating
     */
    public function getSellerRating($sellerId)
    {
        return Cache::remember("seller_rating_{$sellerId}", 300, function () use ($sellerId) {
            $aggregate = RatingAggregate::forSeller($sellerId)->first();
            
            if (!$aggregate) {
                $this->calculateSellerRating($sellerId);
                $aggregate = RatingAggregate::forSeller($sellerId)->first();
            }

            return $aggregate;
        });
    }

    /**
     * Verify customer has EVER purchased from this seller
     */
    public function verifyVerifiedBuyer($customerId, $sellerId)
    {
        $hasPurchase = OrderItem::whereHas('order', function ($q) use ($customerId) {
                $q->where('user_id', $customerId)
                  ->whereIn('status', ['delivered', 'completed', 'received']);
            })
            ->whereHas('product', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })
            ->exists();

        if (!$hasPurchase) {
            throw new \Exception('You must have a delivered order from this seller to review them.');
        }

        return true;
    }

    /**
     * Check if customer is eligible to review a product
     */
    public function checkReviewEligibility($customerId, $productId)
    {
        // Check for delivered or completed orders containing this product
        $orderItem = OrderItem::where('product_id', $productId)
            ->whereHas('order', function ($query) use ($customerId) {
                $query->where('user_id', $customerId)
                    ->whereIn('status', ['delivered', 'completed', 'received']);
            })
            ->latest()
            ->first();

        if (!$orderItem) {
            return [
                'can_review' => false,
                'message' => 'You must purchase this product first and have it delivered to write a review.',
                'order_id' => null
            ];
        }

        // Check if already reviewed for this specific order
        $existingReview = Review::where('customer_id', $customerId)
            ->where('product_id', $productId)
            ->where('order_id', $orderItem->order_id)
            ->first();

        if ($existingReview) {
            if ($existingReview->status === 'pending') {
                return [
                    'can_review' => false,
                    'is_pending' => true,
                    'message' => 'Thank you! Your review is currently under moderation and will be visible soon.',
                    'order_id' => $orderItem->order_id
                ];
            }
            return [
                'can_review' => false,
                'message' => 'You have already reviewed this product for your recent order.',
                'order_id' => $orderItem->order_id
            ];
        }

        return [
            'can_review' => true,
            'message' => 'You can review this product.',
            'order_id' => $orderItem->order_id
        ];
    }
}
