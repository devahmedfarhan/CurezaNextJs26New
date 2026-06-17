<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\BlogPost;
use App\Http\Requests\StoreBlogPostRequest;
use App\Http\Requests\UpdateBlogPostRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AdminBlogPostController extends Controller
{
    public function index()
    {
        $posts = BlogPost::with(['category', 'author', 'tags'])->latest()->paginate(10);
        return response()->json($posts);
    }

    public function store(StoreBlogPostRequest $request)
    {
        $data = $request->validated();
        
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('blog', 'public');
            $data['featured_image'] = '/storage/' . $path;
        }

        if ($request->hasFile('fact_checker_image')) {
            $path = $request->file('fact_checker_image')->store('blog', 'public');
            $data['fact_checker_image'] = '/storage/' . $path;
        }

        // Robustly parse JSON inputs if sent as serialized strings from FormData
        if (isset($data['recommended_products']) && is_string($data['recommended_products'])) {
            $data['recommended_products'] = json_decode($data['recommended_products'], true);
        }
        if (isset($data['citations']) && is_string($data['citations'])) {
            $data['citations'] = json_decode($data['citations'], true);
        }

        $post = BlogPost::create($data);
        
        if ($request->has('tags')) {
            $post->tags()->attach($request->tags);
        }

        return response()->json($post, 201);
    }

    public function show($id)
    {
        $post = BlogPost::with(['category', 'author', 'tags'])->findOrFail($id);
        return response()->json($post);
    }

    public function update(UpdateBlogPostRequest $request, $id)
    {
        $post = BlogPost::findOrFail($id);
        
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('blog', 'public');
            $data['featured_image'] = '/storage/' . $path;
        }

        if ($request->hasFile('fact_checker_image')) {
            $path = $request->file('fact_checker_image')->store('blog', 'public');
            $data['fact_checker_image'] = '/storage/' . $path;
        }

        // Robustly parse JSON inputs if sent as serialized strings from FormData
        if (isset($data['recommended_products']) && is_string($data['recommended_products'])) {
            $data['recommended_products'] = json_decode($data['recommended_products'], true);
        }
        if (isset($data['citations']) && is_string($data['citations'])) {
            $data['citations'] = json_decode($data['citations'], true);
        }

        $post->update($data);

        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }

        return response()->json($post);
    }

    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();
        return response()->json(null, 204);
    }
}
