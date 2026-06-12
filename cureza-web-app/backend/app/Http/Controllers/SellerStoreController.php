<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\StoreChangeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SellerStoreController extends Controller
{
    public function getProfile()
    {
        $seller = Auth::user();
        
        // Ensure seller has a brand (should be created on registration or later)
        if (!$seller->brand) {
            return response()->json(['message' => 'Brand profile not found.'], 404);
        }

        $brand = $seller->brand()->with('changeRequests')->first();
        
        // Check for pending request
        $pendingRequest = $brand->changeRequests()
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'brand' => $brand,
            'pending_request' => $pendingRequest
        ]);
    }

    public function updateProfile(Request $request)
    {
        $seller = Auth::user();
        $brand = $seller->brand;

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        // Check if there is already a pending request
        $existingRequest = $brand->changeRequests()->where('status', 'pending')->exists();
        if ($existingRequest) {
            return response()->json(['message' => 'You already have a pending change request. Please wait for approval.'], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_description' => 'required|string|max:255',
            'description' => 'nullable|string', // Long Description (HTML/text)
            'keywords' => 'nullable|array',
            'logo' => 'nullable|image|max:2048', // 2MB max
            'banner' => 'nullable|image|max:4096', // 4MB max
        ]);

        $proposedData = [
            'name' => $validated['name'],
            'short_description' => $validated['short_description'],
            'description' => $validated['description'] ?? null,
            'keywords' => $validated['keywords'] ?? [],
            'logo' => $brand->logo, // default to existing
            'banner_path' => $brand->banner_path, // default to existing
        ];

        // Handle File Uploads (Store new files but don't attach to Brand yet)
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands/logos', 'public');
            $proposedData['logo'] = '/storage/' . $path;
        }

        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('brands/banners', 'public');
            $proposedData['banner_path'] = '/storage/' . $path;
        }

        // Create Request
        $changeRequest = StoreChangeRequest::create([
            'seller_id' => $seller->id,
            'brand_id' => $brand->id,
            'proposed_data' => $proposedData,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Profile update submitted for approval.',
            'request' => $changeRequest
        ]);
    }

    public function cancelRequest($id)
    {
        $seller = Auth::user();
        $request = StoreChangeRequest::where('id', $id)->where('seller_id', $seller->id)->firstOrFail();
        
        if ($request->status !== 'pending') {
            return response()->json(['message' => 'Cannot cancel a processed request.'], 400);
        }

        $request->delete(); // Or set to 'cancelled' field if we had one. Deleting is fine.

        return response()->json(['message' => 'Request cancelled.']);
    }
}
