<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RewardSlab;
use Illuminate\Http\Request;

class AdminRewardSlabController extends Controller
{
    public function index()
    {
        return response()->json(RewardSlab::with(['giftProduct', 'giftVariant'])->orderBy('min_value', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_value' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'free_shipping' => 'boolean',
            'gift_product_id' => 'nullable|exists:products,id',
            'gift_variant_id' => 'nullable|exists:product_variants,id',
            'display_icon_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
            'priority' => 'integer',
        ]);

        $slab = RewardSlab::create($validated);

        return response()->json($slab->load(['giftProduct', 'giftVariant']), 201);
    }

    public function update(Request $request, $id)
    {
        $slab = RewardSlab::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_value' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'free_shipping' => 'boolean',
            'gift_product_id' => 'nullable|exists:products,id',
            'gift_variant_id' => 'nullable|exists:product_variants,id',
            'display_icon_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
            'priority' => 'integer',
        ]);

        $slab->update($validated);

        return response()->json($slab->load(['giftProduct', 'giftVariant']));
    }

    public function destroy($id)
    {
        \Log::info("Attempting to delete reward slab via API: " . $id);
        $slab = RewardSlab::findOrFail($id);
        $slab->delete();
        \Log::info("Successfully deleted reward slab via API: " . $id);

        return response()->json(['message' => 'Reward slab deleted successfully.']);
    }
}
