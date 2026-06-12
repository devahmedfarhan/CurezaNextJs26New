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

        return response()->json($post);
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
