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
        $review->update(['status' => $request->status]);

        // Update product stats
        $review->product->updateRatingStats();

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
