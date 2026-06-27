<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CollectionController extends Controller
{
    /**
     * Display a listing of collections.
     */
    public function index(Request $request)
    {
        $query = Collection::withCount('products');
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created collection.
     */
    public function store(Request $request)
    {
        Log::info('Collection Store Request Data:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'is_active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $slug = Str::slug($validated['name']);
        if (Collection::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . uniqid();
        }

        // Handle Image Upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('collections', 'public');
            $imagePath = '/storage/' . $imagePath;
        }

        $collection = Collection::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'image' => $imagePath,
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN)
        ]);

        // Sync associated products
        if (!empty($validated['product_ids'])) {
            $collection->products()->sync($validated['product_ids']);
        }

        return response()->json($collection->load('products'), 201);
    }

    /**
     * Update the specified collection in storage.
     */
    public function update(Request $request, $id)
    {
        Log::info("Collection Update Request for ID {$id}:", $request->all());

        $collection = Collection::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'sometimes',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $data = $validated;
        unset($data['product_ids']);

        // Handle Image Upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($collection->image) {
                $oldPath = str_replace('/storage/', '', $collection->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('collections', 'public');
            $data['image'] = '/storage/' . $path;
        }

        if (isset($validated['is_active'])) {
            $data['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        $collection->update($data);

        // Sync associated products if present in request (empty array is also synced)
        if ($request->has('product_ids')) {
            $collection->products()->sync($request->product_ids ?? []);
        }

        return response()->json($collection->load('products'));
    }

    /**
     * Remove the specified collection from storage.
     */
    public function destroy($id)
    {
        $collection = Collection::findOrFail($id);
        
        // Delete image if exists
        if ($collection->image) {
            $oldPath = str_replace('/storage/', '', $collection->image);
            Storage::disk('public')->delete($oldPath);
        }

        $collection->delete();
        return response()->json(['message' => 'Collection deleted successfully']);
    }

    /**
     * Display a listing of active collections that have at least one product for public store front.
     */
    public function publicIndex(Request $request)
    {
        $collections = Collection::where('is_active', true)
            ->whereHas('products', function ($q) {
                $q->where('status', 'published');
            })
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($collections);
    }

    /**
     * Display the specified collection and its active products for public store front.
     */
    public function showPublic($slug)
    {
        $collection = Collection::where('slug', $slug)
            ->where('is_active', true)
            ->with(['products' => function($q) {
                $q->where('status', 'published')->with(['brand', 'category', 'concern']);
            }])
            ->firstOrFail();

        return response()->json($collection);
    }
}
