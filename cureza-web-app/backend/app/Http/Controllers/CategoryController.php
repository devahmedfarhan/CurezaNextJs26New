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
        
        $query->withCount([
            'products' => function ($q) {
                $q->where('status', 'published');
            },
            'concernProducts' => function ($q) {
                $q->where('status', 'published');
            }
        ]);

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
            'is_active' => 'boolean',
            'show_in_mega_menu' => 'sometimes|boolean',
            'mega_menu_section' => 'nullable|string|max:255'
        ]);

        $slug = Str::slug($validated['name']);
        if (Category::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . uniqid();
        }

        // Handle Image Upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            try {
                $imageKit = app(\App\Services\ImageKitService::class);
                $file = $request->file('image');
                $result = $imageKit->upload(
                    $file,
                    $file->getClientOriginalName(),
                    'categories'
                );
                $imagePath = $result['url'];

                // Index in our media library database table
                \App\Models\Media::create([
                    'file_id' => $result['fileId'] ?? null,
                    'url' => $result['url'],
                    'thumbnail_url' => $result['thumbnailUrl'] ?? null,
                    'file_name' => $file->getClientOriginalName(),
                    'size_bytes' => $file->getSize(),
                    'extension' => strtolower($file->getClientOriginalExtension()),
                    'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'tags' => ['categories', 'legacy-upload'],
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Category ImageKit upload failed: ' . $e->getMessage());
                $imagePath = $request->file('image')->store('categories', 'public');
                $imagePath = '/storage/' . $imagePath;
            }
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
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
            'show_in_mega_menu' => filter_var($request->input('show_in_mega_menu', true), FILTER_VALIDATE_BOOLEAN),
            'mega_menu_section' => $request->input('mega_menu_section') ?? null
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
            'is_active' => 'sometimes',
            'show_in_mega_menu' => 'sometimes',
            'mega_menu_section' => 'nullable|string|max:255'
        ]);

        $data = $validated;
        
        // Handle Image Upload
        if ($request->hasFile('image')) {
            try {
                $imageKit = app(\App\Services\ImageKitService::class);
                $file = $request->file('image');
                
                // Delete old local image if exists
                if ($category->image && !str_starts_with($category->image, 'http')) {
                    $oldPath = str_replace('/storage/', '', $category->image);
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                }
                
                $result = $imageKit->upload(
                    $file,
                    $file->getClientOriginalName(),
                    'categories'
                );
                $data['image'] = $result['url'];

                // Index in our media library database table
                \App\Models\Media::create([
                    'file_id' => $result['fileId'] ?? null,
                    'url' => $result['url'],
                    'thumbnail_url' => $result['thumbnailUrl'] ?? null,
                    'file_name' => $file->getClientOriginalName(),
                    'size_bytes' => $file->getSize(),
                    'extension' => strtolower($file->getClientOriginalExtension()),
                    'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'tags' => ['categories', 'legacy-upload'],
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Category update ImageKit upload failed: ' . $e->getMessage());
                $path = $request->file('image')->store('categories', 'public');
                $data['image'] = '/storage/' . $path;
            }
        }


        if (isset($validated['is_active'])) {
             $data['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($validated['show_in_mega_menu'])) {
             $data['show_in_mega_menu'] = filter_var($validated['show_in_mega_menu'], FILTER_VALIDATE_BOOLEAN);
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
        $all = filter_var($request->input('all', false), FILTER_VALIDATE_BOOLEAN);

        if ($all) {
            $query = Category::where('is_active', true);
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }
            $query->withCount([
                'products' => function ($q) {
                    $q->where('status', 'published');
                },
                'concernProducts' => function ($q) {
                    $q->where('status', 'published');
                }
            ]);
            return response()->json($query->orderBy('name', 'asc')->get());
        }

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
