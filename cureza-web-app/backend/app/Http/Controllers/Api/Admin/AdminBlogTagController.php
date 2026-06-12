<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\BlogTag;
use App\Http\Requests\StoreBlogTagRequest;
use App\Http\Requests\UpdateBlogTagRequest;
use App\Http\Controllers\Controller;

class AdminBlogTagController extends Controller
{
    public function index()
    {
        $tags = BlogTag::latest()->get();
        return response()->json($tags);
    }

    public function store(StoreBlogTagRequest $request)
    {
        $tag = BlogTag::create($request->validated());
        return response()->json($tag, 201);
    }

    public function show($id)
    {
        $tag = BlogTag::findOrFail($id);
        return response()->json($tag);
    }

    public function update(UpdateBlogTagRequest $request, $id)
    {
        $tag = BlogTag::findOrFail($id);
        $tag->update($request->validated());
        return response()->json($tag);
    }

    public function destroy($id)
    {
        $tag = BlogTag::findOrFail($id);
        $tag->delete();
        return response()->json(null, 204);
    }
}
