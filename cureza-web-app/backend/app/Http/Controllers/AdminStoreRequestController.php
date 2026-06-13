<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\StoreChangeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminStoreRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = StoreChangeRequest::with(['seller', 'brand'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function show($id)
    {
        $request = StoreChangeRequest::with(['seller', 'brand'])->findOrFail($id);
        return response()->json($request);
    }

    public function approve($id)
    {
        $changeRequest = StoreChangeRequest::with('brand')->findOrFail($id);

        if ($changeRequest->status !== 'pending') {
            return response()->json(['message' => 'Request is not pending.'], 400);
        }

        // Apply changes to Brand
        $brand = $changeRequest->brand;
        $proposed = $changeRequest->proposed_data;

        $brand->update([
            'name' => $proposed['name'] ?? $brand->name,
            'short_description' => $proposed['short_description'] ?? $brand->short_description,
            'description' => $proposed['description'] ?? $brand->description,
            'keywords' => $proposed['keywords'] ?? $brand->keywords,
            'logo' => $proposed['logo'] ?? $brand->logo,
            'banner_path' => $proposed['banner_path'] ?? $brand->banner_path,
            
            // New SEO & FAQ columns applied on approval
            'meta_title' => $proposed['meta_title'] ?? $brand->meta_title,
            'meta_description' => $proposed['meta_description'] ?? $brand->meta_description,
            'meta_keywords' => $proposed['meta_keywords'] ?? $brand->meta_keywords,
            'faqs' => $proposed['faqs'] ?? $brand->faqs,
        ]);

        // Sync brand categories & concerns
        $allIds = array_merge($proposed['categories'] ?? [], $proposed['concerns'] ?? []);
        $brand->allCategories()->sync($allIds);

        $changeRequest->update([
            'status' => 'approved',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Store profile updated successfully.']);
    }

    public function reject(Request $request, $id)
    {
        $changeRequest = StoreChangeRequest::findOrFail($id);

        if ($changeRequest->status !== 'pending') {
            return response()->json(['message' => 'Request is not pending.'], 400);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string'
        ]);

        $changeRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Request rejected.']);
    }

    /**
     * Update brand profile directly (Superadmin control).
     */
    public function updateBrand(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_description' => 'required|string|max:255',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
            'logo' => 'nullable|string',
            'banner_path' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string|max:255',
            'faqs' => 'nullable|array',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
            'concerns' => 'nullable|array',
            'concerns.*' => 'integer|exists:categories,id',
        ]);

        $brand->update([
            'name' => $validated['name'],
            'short_description' => $validated['short_description'],
            'description' => $validated['description'] ?? null,
            'keywords' => $validated['keywords'] ?? [],
            'logo' => $validated['logo'] ?? $brand->logo,
            'banner_path' => $validated['banner_path'] ?? $brand->banner_path,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
            'faqs' => $validated['faqs'] ?? null,
        ]);

        // Handle File Uploads for direct edits if files provided
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands/logos', 'public');
            $brand->update(['logo' => '/storage/' . $path]);
        }

        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('brands/banners', 'public');
            $brand->update(['banner_path' => '/storage/' . $path]);
        }

        // Sync brand categories & concerns
        $allIds = array_merge($validated['categories'] ?? [], $validated['concerns'] ?? []);
        $brand->allCategories()->sync($allIds);

        return response()->json([
            'message' => 'Store profile updated directly.',
            'brand' => $brand->load(['categories', 'concerns'])
        ]);
    }
}
