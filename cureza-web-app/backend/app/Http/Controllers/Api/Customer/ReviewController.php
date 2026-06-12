<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
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
     * Submit a product review
     */
    public function createProductReview(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
            'media.*' => 'nullable|file|mimes:jpg,jpeg,png,mp4|max:10240',
        ]);

        try {
            // XSS Protection - strip HTML tags from review text
            $reviewText = $request->review_text ? strip_tags($request->review_text) : null;

            $review = $this->reviewService->createProductReview(
                Auth::id(),
                $request->product_id,
                $request->order_id,
                $request->rating,
                $reviewText,
                $request->hasFile('media') ? $request->file('media') : []
            );

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Submit a seller/brand review
     */
    public function createSellerReview(Request $request)
    {
        $request->validate([
            'seller_id' => 'required|exists:users,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        try {
            // XSS Protection - strip HTML tags
            $reviewText = $request->review_text ? strip_tags($request->review_text) : null;

            $user = Auth::user();
            
            $review = $this->reviewService->createSellerReview(
                $user->id,
                $request->seller_id,
                $request->order_id,
                $request->rating,
                $reviewText,
                $user->name,
                $user->email
            );

            return response()->json([
                'success' => true,
                'message' => 'Seller review submitted successfully',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get customer's own reviews
     */
    public function myReviews(Request $request)
    {
        $customerId = Auth::id();

        $reviews = \App\Models\Review::where('customer_id', $customerId)
            ->with(['product', 'seller', 'reply', 'mediaItems'])
            ->when($request->type, function ($query, $type) {
                $query->where('review_type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Check if customer is eligible to review a product
     */
    public function checkProductReviewEligibility($productId)
    {
        $eligibility = $this->reviewService->checkReviewEligibility(Auth::id(), $productId);

        return response()->json([
            'success' => true,
            'data' => $eligibility
        ]);
    }

    /**
     * Submit a doctor review
     */
    public function createDoctorReview(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        try {
            $reviewText = $request->review_text ? strip_tags($request->review_text) : null;

            $review = $this->reviewService->createDoctorReview(
                Auth::id(),
                $request->doctor_id,
                $request->rating,
                $reviewText
            );

            return response()->json([
                'success' => true,
                'message' => 'Doctor review submitted successfully',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Check if customer can review a doctor
     */
    public function checkDoctorReviewEligibility($doctorId)
    {
        $customerId = Auth::id();
        $hasPrescription = \App\Models\Prescription::where('user_id', $customerId)
            ->where('doctor_id', $doctorId)
            ->exists();

        $hasAppointment = \App\Models\Appointment::where('user_id', $customerId)
            ->where('doctor_id', $doctorId)
            ->where('status', 'completed')
            ->exists();

        $alreadyReviewed = \App\Models\Review::where('customer_id', $customerId)
            ->where('seller_id', $doctorId)
            ->where('review_type', 'seller')
            ->whereNull('product_id')
            ->whereNull('order_id')
            ->exists();

        $canReview = ($hasPrescription || $hasAppointment) && !$alreadyReviewed;

        return response()->json([
            'success' => true,
            'data' => [
                'can_review' => $canReview,
                'already_reviewed' => $alreadyReviewed,
                'message' => $alreadyReviewed 
                    ? 'You have already reviewed this doctor.' 
                    : ($canReview ? 'You can review this doctor.' : 'You must have a completed consultation or prescription with this doctor first.')
            ]
        ]);
    }
}
