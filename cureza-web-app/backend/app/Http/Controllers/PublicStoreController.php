<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\Request;

class PublicStoreController extends Controller
{
    public function index(Request $request) {
        $query = Brand::where('is_active', true);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $brands = $query->paginate(20);

        return response()->json($brands);
    }

    public function show($slug)
    {
        $brand = Brand::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // Load active products for this seller/brand
        $products = Product::where('brand_id', $brand->id)
            ->active()
            ->with(['category'])
            ->paginate(16); // 4x4 Grid

        // Calculate Ratings & Reviews Stats
        $sellerId = $brand->user_id;
        $activeReviews = \App\Models\Review::where('seller_id', $sellerId)->where('status', 'active');
        
        $stats = [
            'average_rating' => round($activeReviews->avg('rating') ?? 0, 1),
            'total_reviews' => $activeReviews->count(),
            'product_reviews_count' => (clone $activeReviews)->where('review_type', 'product')->count(),
            'seller_reviews_count' => (clone $activeReviews)->where('review_type', 'seller')->count(),
        ];

        return response()->json([
            'brand' => $brand,
            'products' => $products,
            'stats' => $stats
        ]);
    }
}
