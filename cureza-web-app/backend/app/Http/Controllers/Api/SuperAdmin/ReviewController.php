<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewReply;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    protected $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
        // Middleware is applied in routes/api.php
    }

    /**
     * Get all reviews (all sellers, all products)
     */
    public function index(Request $request)
    {
        $reviews = Review::query()
            ->with(['customer', 'seller', 'product', 'reply', 'mediaItems', 'moderator'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->type, function ($query, $type) {
                $query->where('review_type', $type);
            })
            ->when($request->seller_id, function ($query, $sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->when($request->product_id, function ($query, $productId) {
                $query->where('product_id', $productId);
            })
            ->when($request->rating, function ($query, $rating) {
                $query->where('rating', $rating);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('review_text', 'like', "%{$search}%")
                      ->orWhereHas('customer', function ($cq) use ($search) {
                          $cq->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

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
        $review = Review::with(['customer', 'seller', 'product', 'order', 'reply', 'mediaItems', 'moderator'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    /**
     * Create manual review (admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'seller_id' => 'nullable|exists:users,id',
            'product_id' => 'nullable|exists:products,id',
            'order_id' => 'required|exists:orders,id',
            'review_type' => 'required|in:product,seller',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        try {
            $review = Review::create([
                'customer_id' => $request->customer_id,
                'seller_id' => $request->seller_id,
                'product_id' => $request->product_id,
                'order_id' => $request->order_id,
                'review_type' => $request->review_type,
                'rating' => $request->rating,
                'review_text' => $request->review_text,
                'status' => 'active',
                'reviewed_at' => now(),
                'moderated_by' => Auth::id(),
                'moderated_at' => now(),
            ]);

            // Recalculate ratings
            if ($request->product_id) {
                $this->reviewService->calculateProductRating($request->product_id);
            }
            if ($request->seller_id) {
                $this->reviewService->calculateSellerRating($request->seller_id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Review created successfully',
                'data' => $review->load(['customer', 'seller', 'product'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update review
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'rating' => 'nullable|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        $review = Review::findOrFail($id);

        $review->update([
            'rating' => $request->rating ?? $review->rating,
            'review_text' => $request->review_text ?? $review->review_text,
            'moderated_by' => Auth::id(),
            'moderated_at' => now(),
        ]);

        // Recalculate ratings
        if ($review->product_id) {
            $this->reviewService->calculateProductRating($review->product_id);
        }
        if ($review->seller_id) {
            $this->reviewService->calculateSellerRating($review->seller_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $review->fresh(['customer', 'seller', 'product', 'moderator'])
        ]);
    }

    /**
     * Delete review
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        
        $productId = $review->product_id;
        $sellerId = $review->seller_id;

        $review->delete(); // Soft delete

        // Recalculate ratings
        if ($productId) {
            $this->reviewService->calculateProductRating($productId);
        }
        if ($sellerId) {
            $this->reviewService->calculateSellerRating($sellerId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Change review status (hide/unhide)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,hidden,deleted',
        ]);

        $review = Review::findOrFail($id);

        $review->update([
            'status' => $request->status,
            'moderated_by' => Auth::id(),
            'moderated_at' => now(),
        ]);

        // Recalculate ratings
        if ($review->product_id) {
            $this->reviewService->calculateProductRating($review->product_id);
        }
        if ($review->seller_id) {
            $this->reviewService->calculateSellerRating($review->seller_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review status updated successfully',
            'data' => $review->fresh()
        ]);
    }

    /**
     * Get global statistics
     */
    public function statistics()
    {
        $stats = [
            'total_reviews' => Review::count(),
            'active_reviews' => Review::where('status', 'active')->count(),
            'hidden_reviews' => Review::where('status', 'hidden')->count(),
            'product_reviews' => Review::where('review_type', 'product')->count(),
            'seller_reviews' => Review::where('review_type', 'seller')->count(),
            'average_rating' => round(Review::where('status', 'active')->avg('rating'), 2),
            'total_replies' => ReviewReply::count(),
            'pending_moderation' => Review::where('status', 'pending')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Delete a review reply
     */
    public function deleteReply($id)
    {
        $reply = ReviewReply::findOrFail($id);
        $reply->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reply deleted successfully'
        ]);
    }
}
