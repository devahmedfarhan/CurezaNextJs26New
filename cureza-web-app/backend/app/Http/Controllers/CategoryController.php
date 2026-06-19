<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query();
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Category Store Request:', $request->all());
        
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            \Illuminate\Support\Facades\Log::info('Image File Details:', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'error' => $file->getError(),
                'is_valid' => $file->isValid()
            ]);
        } else {
            \Illuminate\Support\Facades\Log::info('No image file received.');
            \Illuminate\Support\Facades\Log::info('Image input type: ' . gettype($request->input('image')));
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:category,concern',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'icon' => 'nullable|string|max:255', // Assuming icon is text/emoji for now, or url
            'sub_heading' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'bottom_description' => 'nullable|string',
            'is_active' => 'boolean' // Accept boolean or string 'true'/'false'
        ]);

        $slug = Str::slug($validated['name']);
        if (Category::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . uniqid();
        }

        // Handle Image Upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
            $imagePath = '/storage/' . $imagePath;
        }

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'type' => $validated['type'],
            'parent_id' => $validated['parent_id'] ?? null,
            'image' => $imagePath,
            'icon' => $validated['icon'] ?? null,
            'sub_heading' => $validated['sub_heading'] ?? null,
            'description' => $validated['description'] ?? null,
            'bottom_description' => $validated['bottom_description'] ?? null,
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN)
        ]);

        \Illuminate\Support\Facades\Cache::forget('public_categories_all');
        \Illuminate\Support\Facades\Cache::forget('public_categories_category');
        \Illuminate\Support\Facades\Cache::forget('public_categories_concern');

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:category,concern',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'icon' => 'nullable|string|max:255',
            'sub_heading' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'bottom_description' => 'nullable|string',
            'is_active' => 'sometimes'
        ]);

        $data = $validated;
        
        // Handle Image Upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($category->image) {
                $oldPath = str_replace('/storage/', '', $category->image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('categories', 'public');
            $data['image'] = '/storage/' . $path;
        }

        if (isset($validated['is_active'])) {
             $data['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        \Illuminate\Support\Facades\Cache::forget('public_categories_all');
        \Illuminate\Support\Facades\Cache::forget('public_categories_category');
        \Illuminate\Support\Facades\Cache::forget('public_categories_concern');

        $category->update($data);
        return response()->json($category);
    }

    public function destroy($id)
    {
        Category::findOrFail($id)->delete();
        
        \Illuminate\Support\Facades\Cache::forget('public_categories_all');
        \Illuminate\Support\Facades\Cache::forget('public_categories_category');
        \Illuminate\Support\Facades\Cache::forget('public_categories_concern');

        return response()->json(['message' => 'Deleted successfully']);
    }

    public function publicIndex(Request $request)
    {
        $type = $request->input('type', 'all');
        $cacheKey = "public_categories_" . $type;

        $categories = \Illuminate\Support\Facades\Cache::remember($cacheKey, 900, function() use ($request) {
            $query = Category::where('is_active', true);
            
            if ($request->has('type')) {
                $type = $request->type;
                $query->where('type', $type);
                
                if ($type === 'category') {
                    $query->whereHas('products', function ($q) {
                        $q->where('status', 'published');
                    });
                } elseif ($type === 'concern') {
                    $query->whereHas('concernProducts', function ($q) {
                        $q->where('status', 'published');
                    });
                }
            } else {
                $query->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('type', 'category')
                            ->whereHas('products', function ($p) {
                                $p->where('status', 'published');
                            });
                    })->orWhere(function ($sub) {
                        $sub->where('type', 'concern')
                            ->whereHas('concernProducts', function ($p) {
                                $p->where('status', 'published');
                            });
                    });
                });
            }
            return $query->get();
        });

        return response()->json($categories);
    }
}
