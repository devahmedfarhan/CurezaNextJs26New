<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\BlogAuthor;
use App\Http\Requests\StoreBlogAuthorRequest;
use App\Http\Requests\UpdateBlogAuthorRequest;
use App\Http\Controllers\Controller;

class AdminBlogAuthorController extends Controller
{
    public function index()
    {
        $authors = BlogAuthor::latest()->get();
        return response()->json($authors);
    }

    public function store(StoreBlogAuthorRequest $request)
    {
        $author = BlogAuthor::create($request->validated());
        return response()->json($author, 201);
    }

    public function show($id)
    {
        $author = BlogAuthor::findOrFail($id);
        return response()->json($author);
    }

    public function update(UpdateBlogAuthorRequest $request, $id)
    {
        $author = BlogAuthor::findOrFail($id);
        $author->update($request->validated());
        return response()->json($author);
    }

    public function destroy($id)
    {
        $author = BlogAuthor::findOrFail($id);
        $author->delete();
        return response()->json(null, 204);
    }
}
