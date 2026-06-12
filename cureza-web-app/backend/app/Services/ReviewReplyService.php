<?php

namespace App\Services;

use App\Models\Review;
use App\Models\ReviewReply;
use Illuminate\Support\Facades\DB;

class ReviewReplyService
{
    /**
     * Create a reply to a review
     */
    public function createReply($reviewId, $sellerId, $replyText)
    {
        // Get the review
        $review = Review::findOrFail($reviewId);

        // Verify seller can reply to this review
        $this->canReply($review, $sellerId);

        // Check if seller already replied
        if ($this->hasReplied($reviewId, $sellerId)) {
            throw new \Exception('You have already replied to this review.');
        }

        DB::beginTransaction();
        try {
            // Create reply
            $reply = ReviewReply::create([
                'review_id' => $reviewId,
                'seller_id' => $sellerId,
                'reply_text' => $replyText,
                'status' => 'active',
            ]);

            // TODO: Send notification to customer
            // $this->notifyCustomer($review->customer_id, $reply);

            DB::commit();

            return $reply->load(['seller', 'review']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing reply (seller can edit their own reply)
     */
    public function updateReply($replyId, $sellerId, $replyText)
    {
        $reply = ReviewReply::findOrFail($replyId);

        // Verify ownership
        if ($reply->seller_id !== $sellerId) {
            throw new \Exception('You can only edit your own replies.');
        }

        $reply->update([
            'reply_text' => $replyText,
            'updated_at' => now(),
        ]);

        return $reply->fresh();
    }

    /**
     * Verify seller can reply to the review
     */
    protected function canReply($review, $sellerId)
    {
        // Check if review is active
        if ($review->status !== 'active') {
            throw new \Exception('Cannot reply to inactive reviews.');
        }

        // Check if review belongs to seller's products or brand
        if ($review->seller_id !== $sellerId) {
            throw new \Exception('You can only reply to reviews for your products or brand.');
        }

        return true;
    }

    /**
     * Check if seller already replied
     */
    protected function hasReplied($reviewId, $sellerId)
    {
        return ReviewReply::where('review_id', $reviewId)
            ->where('seller_id', $sellerId)
            ->exists();
    }

    /**
     * Get all replies by seller
     */
    public function getSellerReplies($sellerId, $page = 1, $perPage = 20)
    {
        return ReviewReply::where('seller_id', $sellerId)
            ->with(['review', 'review.customer', 'review.product'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get reviews that need replies for a seller
     */
    public function getPendingReplies($sellerId, $page = 1, $perPage = 20)
    {
        return Review::active()
            ->where('seller_id', $sellerId)
            ->doesntHave('reply')
            ->with(['customer', 'product'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get reply statistics for seller
     */
    public function getReplyStats($sellerId)
    {
        $totalReviews = Review::active()
            ->where('seller_id', $sellerId)
            ->count();

        $repliedCount = Review::active()
            ->where('seller_id', $sellerId)
            ->has('reply')
            ->count();

        $pendingReplies = $totalReviews - $repliedCount;
        $replyRate = $totalReviews > 0 ? round(($repliedCount / $totalReviews) * 100, 1) : 0;

        return [
            'total_reviews' => $totalReviews,
            'replied_count' => $repliedCount,
            'pending_replies' => $pendingReplies,
            'reply_rate' => $replyRate,
        ];
    }
}
