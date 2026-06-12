<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Services\ReviewReplyService;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    protected $replyService;

    public function __construct(ReviewReplyService $replyService)
    {
        $this->replyService = $replyService;
        // Middleware is applied in routes/api.php
    }

    /**
     * Get all reviews for seller (product + brand)
     */
    public function index(Request $request)
    {
        $sellerId = Auth::id();

        $reviews = Review::active()
            ->where('seller_id', $sellerId)
            ->with(['customer', 'product', 'reply', 'mediaItems'])
            ->when($request->type, function ($query, $type) {
                $query->where('review_type', $type);
            })
            ->when($request->rating, function ($query, $rating) {
                $query->where('rating', $rating);
            })
            ->when($request->has_reply !== null, function ($query) use ($request) {
                if ($request->has_reply == 'true' || $request->has_reply == '1') {
                    $query->has('reply');
                } else {
                    $query->doesntHave('reply');
                }
            })
            ->when($request->product_id, function ($query, $productId) {
                $query->where('product_id', $productId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Get single review detail
     */
    public function show($id)
    {
        $sellerId = Auth::id();

        $review = Review::where('id', $id)
            ->where('seller_id', $sellerId)
            ->with(['customer', 'product', 'order', 'reply', 'mediaItems'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    /**
     * Reply to a review
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply_text' => 'required|string|max:1000',
        ]);

        try {
            $sellerId = Auth::id();

            $reply = $this->replyService->createReply(
                $id,
                $sellerId,
                $request->reply_text
            );

            return response()->json([
                'success' => true,
                'message' => 'Reply posted successfully',
                'data' => $reply
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get review statistics for seller
     */
    public function statistics()
    {
        $sellerId = Auth::id();

        // Get reply stats
        $replyStats = $this->replyService->getReplyStats($sellerId);

        // Get rating breakdown
        $ratingAggregate = \App\Models\RatingAggregate::forSeller($sellerId)->first();

        // Get recent reviews
        $recentReviews = Review::active()
            ->where('seller_id', $sellerId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->with(['customer', 'product'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'reply_stats' => $replyStats,
                'rating_aggregate' => $ratingAggregate,
                'recent_reviews' => $recentReviews,
            ]
        ]);
    }

    /**
     * Get pending replies (reviews without seller response)
     */
    public function pendingReplies(Request $request)
    {
        $sellerId = Auth::id();

        $reviews = $this->replyService->getPendingReplies(
            $sellerId,
            $request->page ?? 1,
            $request->per_page ?? 10
        );

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }
}
