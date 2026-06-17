<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\RewardRedemption;
use Illuminate\Http\Request;

class AdminRewardController extends Controller
{
    public function index()
    {
        $rewards = Reward::latest()->get();
        return response()->json($rewards);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'points_cost' => 'required|integer|min:1',
            'type' => 'required|string|in:coupon,physical,digital',
            'coupon_code' => 'nullable|string|max:50',
            'stock' => 'required|integer|min:-1',
            'image_url' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $reward = Reward::create($validated);

        return response()->json([
            'message' => 'Reward item created successfully!',
            'reward' => $reward,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $reward = Reward::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'points_cost' => 'required|integer|min:1',
            'type' => 'required|string|in:coupon,physical,digital',
            'coupon_code' => 'nullable|string|max:50',
            'stock' => 'required|integer|min:-1',
            'image_url' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $reward->update($validated);

        return response()->json([
            'message' => 'Reward item updated successfully!',
            'reward' => $reward,
        ]);
    }

    public function destroy($id)
    {
        $reward = Reward::findOrFail($id);
        $reward->delete();

        return response()->json([
            'message' => 'Reward item deleted successfully!'
        ]);
    }

    public function redemptions(Request $request)
    {
        $query = RewardRedemption::with(['user:id,name,email', 'reward:id,name,type,points_cost'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $redemptions = $query->paginate(20);

        return response()->json($redemptions);
    }

    public function updateRedemptionStatus(Request $request, $id)
    {
        $redemption = RewardRedemption::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,fulfilled,cancelled',
        ]);

        $redemption->update($validated);

        return response()->json([
            'message' => 'Redemption status updated successfully!',
            'redemption' => $redemption,
        ]);
    }
}
