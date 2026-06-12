<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\BlogCategory;
use App\Http\Requests\StoreBlogCategoryRequest;
use App\Http\Requests\UpdateBlogCategoryRequest;
use App\Http\Controllers\Controller;

class AdminBlogCategoryController extends Controller
{
    public function index()
    {
        $categories = BlogCategory::latest()->get();
        return response()->json($categories);
    }

    public function store(StoreBlogCategoryRequest $request)
    {
        $category = BlogCategory::create($request->validated());
        return response()->json($category, 201);
    }

    public function show($id)
    {
        $category = BlogCategory::findOrFail($id);
        return response()->json($category);
    }

    public function update(UpdateBlogCategoryRequest $request, $id)
    {
        $category = BlogCategory::findOrFail($id);
        $category->update($request->validated());
        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = BlogCategory::findOrFail($id);
        $category->delete();
        return response()->json(null, 204);
    }
}
