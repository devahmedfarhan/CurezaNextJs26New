<?php

namespace App\Http\Controllers\Api;

use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\BlogAuthor;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::with(['category', 'author', 'tags'])
            ->where('status', 'published')
            ->where('published_at', '<=', now());

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $posts = $query->latest('published_at')->paginate(9);
        return response()->json($posts);
    }

    public function show($slug)
    {
        $post = BlogPost::with(['category', 'author', 'tags'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $post->increment('views_count');

        // Extract product IDs from content: [product id="X"]
        preg_match_all('/\[product\s+id=["\'](\d+)["\']\]/', $post->content, $matches);
        $injectedProductIds = array_map('intval', $matches[1] ?? []);

        // Fetch recommended products list
        $recommendedProductIds = $post->recommended_products ?? [];

        // Load all referenced products in a single query
        $allProductIds = array_unique(array_merge($injectedProductIds, $recommendedProductIds));

        if (!empty($allProductIds)) {
            $products = \App\Models\Product::whereIn('id', $allProductIds)
                ->where('status', 'published')
                ->get();
            
            $injectedProducts = $products->whereIn('id', $injectedProductIds)->values();
            $recommendedProducts = $products->whereIn('id', $recommendedProductIds)
                ->whereNotIn('id', $injectedProductIds)
                ->values();
        } else {
            $injectedProducts = collect([]);
            $recommendedProducts = collect([]);
        }

        // Attach details to the response
        $post->setAttribute('injected_products', $injectedProducts);
        $post->setAttribute('recommended_products_details', $recommendedProducts);

        return response()->json($post);
    }

    public function popular()
    {
        $posts = BlogPost::with(['category', 'author'])
            ->where('status', 'published')
            ->where('published_at', '<=', now())
            ->orderBy('views_count', 'desc')
            ->take(5)
            ->get();

        return response()->json($posts);
    }

    public function byCategory($slug)
    {
        $category = BlogCategory::where('slug', $slug)->firstOrFail();
        
        $posts = BlogPost::with(['category', 'author', 'tags'])
            ->where('category_id', $category->id)
            ->where('status', 'published')
            ->latest('published_at')
            ->paginate(9);

        return response()->json([
            'category' => $category,
            'posts' => $posts
        ]);
    }

    public function byTag($slug)
    {
        $tag = BlogTag::where('slug', $slug)->firstOrFail();

        $posts = $tag->posts()
            ->with(['category', 'author', 'tags'])
            ->where('status', 'published')
            ->latest('published_at')
            ->paginate(9);

        return response()->json([
            'tag' => $tag,
            'posts' => $posts
        ]);
    }

    public function byAuthor($slug)
    {
        $author = BlogAuthor::where('slug', $slug)->firstOrFail();

        $posts = $author->posts()
            ->with(['category', 'author', 'tags'])
            ->where('status', 'published')
            ->latest('published_at')
            ->paginate(9);

        return response()->json([
            'author' => $author,
            'posts' => $posts
        ]);
    }
}
