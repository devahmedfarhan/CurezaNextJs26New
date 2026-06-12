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
        ]);

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
}
