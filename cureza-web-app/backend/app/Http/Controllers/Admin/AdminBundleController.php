<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BundleOffer;
use App\Models\Product;

class AdminBundleController extends Controller
{
    public function index()
    {
        $bundles = BundleOffer::with('mainProduct')->latest()->paginate(20);
        return response()->json($bundles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'main_product_id' => 'required|exists:products,id',
            'bundled_product_ids' => 'required|array',
            'bundled_product_ids.*' => 'exists:products,id',
            'discount_percentage' => 'required|integer|min:1|max:100',
            'title' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $bundle = BundleOffer::create($validated);
        return response()->json($bundle, 201);
    }

    public function update(Request $request, $id)
    {
        $bundle = BundleOffer::findOrFail($id);

        $validated = $request->validate([
            'main_product_id' => 'sometimes|exists:products,id',
            'bundled_product_ids' => 'sometimes|array',
            'bundled_product_ids.*' => 'exists:products,id',
            'discount_percentage' => 'sometimes|integer|min:1|max:100',
            'title' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $bundle->update($validated);
        return response()->json($bundle);
    }

    public function destroy($id)
    {
        $bundle = BundleOffer::findOrFail($id);
        $bundle->delete();
        return response()->json(['message' => 'Bundle deleted']);
    }
}
