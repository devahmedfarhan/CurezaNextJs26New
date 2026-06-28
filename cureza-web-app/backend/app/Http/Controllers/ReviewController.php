<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    // Public: Submit a review
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'stars' => 'required|integer|min:1|max:5',
            'description' => 'required|string',
            'images' => 'nullable|array',
            'video_url' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                 $path = $file->store('reviews', 'public');
                 $imagePaths[] = $path;
            }
        }

        $review = Review::create([
            'product_id' => $request->product_id,
            'full_name' => $request->full_name,
            'email' => $request->email,
            'rating' => $request->stars, // Map legacy input to new schema
            'review_text' => $request->description, // Map legacy input to new schema
            'images' => $imagePaths,
            'video_url' => $request->video_url,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Review submitted successfully and is pending approval.', 'review' => $review], 201);
    }

    // Public: Get approved reviews for a product
    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->approved()
            ->with(['customer', 'mediaItems', 'reply']) // Eager load relationships
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    // Admin: Get all reviews with filters
    public function adminIndex(Request $request)
    {
        $query = Review::with('product');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->latest()->paginate(20);

        return response()->json($reviews);
    }

    // Admin: Approve/Reject review
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,pending'
        ]);

        $review = Review::findOrFail($id);
        $oldStatus = $review->status;
        $review->update(['status' => $request->status]);

        // Update product stats
        if ($review->product) {
            $review->product->updateRatingStats();
        }

        // Award points/XP on review approval
        $isNowApproved = in_array($request->status, ['approved', 'active']);
        $wasPreviouslyApproved = in_array($oldStatus, ['approved', 'active']);
        
        if ($isNowApproved && !$wasPreviouslyApproved) {
            $reviewer = \App\Models\User::where('email', $review->email)->first() ?? $review->customer;
            if ($reviewer) {
                $rules = \App\Services\GamificationService::getRules();
                $reviewXP = $rules['xp_write_review'] ?? 50;
                $reviewPoints = $rules['points_write_review'] ?? 20;

                \App\Services\GamificationService::adjustXPAndPoints(
                    $reviewer,
                    $reviewXP,
                    $reviewPoints,
                    "Approved honest review for product: " . ($review->product->name ?? 'Product'),
                    'credit',
                    'review_' . $review->id
                );

                // Check for UGC Media
                $hasMedia = (!empty($review->images) && count($review->images) > 0) 
                    || !empty($review->video_url) 
                    || (!empty($review->media) && count($review->media) > 0)
                    || ($review->mediaItems()->count() > 0);

                if ($hasMedia) {
                    $ugcXP = $rules['xp_ugc_upload'] ?? 100;
                    $ugcPoints = $rules['points_ugc_upload'] ?? 40;

                    \App\Services\GamificationService::adjustXPAndPoints(
                        $reviewer,
                        $ugcXP,
                        $ugcPoints,
                        "Approved UGC photo/video upload for: " . ($review->product->name ?? 'Product'),
                        'credit',
                        'ugc_' . $review->id
                    );
                }
            }
        }

        return response()->json(['message' => 'Review status updated successfully.', 'review' => $review]);
    }
    // User: Get my reviews
    public function userIndex(Request $request)
    {
        $user = $request->user();
        $reviews = Review::where('email', $user->email)
            ->with('product')
            ->latest()
            ->get();

        return response()->json($reviews);
    }
}
