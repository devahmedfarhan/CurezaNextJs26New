<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\ReviewService;
use App\Models\Review;
use App\Models\RatingAggregate;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    protected $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * Get product reviews (public)
     */
    public function getProductReviews(Request $request, $productId)
    {
        $reviews = Review::active()
            ->product()
            ->where('product_id', $productId)
            ->with(['customer', 'reply.seller', 'mediaItems'])
            ->when($request->rating, function ($query, $rating) {
                $query->where('rating', $rating);
            })
            ->when($request->sort, function ($query, $sort) {
                switch ($sort) {
                    case 'highest':
                        $query->orderBy('rating', 'desc');
                        break;
                    case 'lowest':
                        $query->orderBy('rating', 'asc');
                        break;
                    case 'oldest':
                        $query->orderBy('created_at', 'asc');
                        break;
                    default: // newest
                        $query->orderBy('created_at', 'desc');
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Get seller reviews (product + brand combined)
     */
    public function getSellerReviews(Request $request, $sellerId)
    {
        $reviews = Review::active()
            ->where('seller_id', $sellerId)
            ->with(['customer', 'product', 'reply', 'mediaItems'])
            ->when($request->type, function ($query, $type) {
                $query->where('review_type', $type);
            })
            ->when($request->rating, function ($query, $rating) {
                $query->where('rating', $rating);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Get product rating aggregate
     */
    public function getProductRating($productId)
    {
        $aggregate = $this->reviewService->getProductRating($productId);

        return response()->json([
            'success' => true,
            'data' => [
                'average_rating' => $aggregate->average_rating ?? 0,
                'total_reviews' => $aggregate->total_reviews ?? 0,
                'breakdown' => $aggregate ? $aggregate->getRatingBreakdown() : [],
            ]
        ]);
    }

    /**
     * Get seller rating aggregate (weighted)
     */
    public function getSellerRating($sellerId)
    {
        $aggregate = $this->reviewService->getSellerRating($sellerId);

        return response()->json([
            'success' => true,
            'data' => [
                'average_rating' => $aggregate->average_rating ?? 0,
                'total_reviews' => $aggregate->total_reviews ?? 0,
                'breakdown' => $aggregate ? $aggregate->getRatingBreakdown() : [],
            ]
        ]);
    }
}
