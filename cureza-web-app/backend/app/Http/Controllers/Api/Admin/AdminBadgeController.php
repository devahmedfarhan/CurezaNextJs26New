<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\Request;

class AdminBadgeController extends Controller
{
    public function index()
    {
        $badges = Badge::latest()->get();
        return response()->json($badges);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string', // Store emoji or icon slug
            'rule_type' => 'required|string|in:points_milestone,challenges_completed,purchases_made,referrals_made',
            'rule_value' => 'required|integer|min:1',
            'is_active' => 'required|boolean',
        ]);

        $badge = Badge::create($validated);

        return response()->json([
            'message' => 'Badge created successfully!',
            'badge' => $badge,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $badge = Badge::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string',
            'rule_type' => 'required|string|in:points_milestone,challenges_completed,purchases_made,referrals_made',
            'rule_value' => 'required|integer|min:1',
            'is_active' => 'required|boolean',
        ]);

        $badge->update($validated);

        return response()->json([
            'message' => 'Badge updated successfully!',
            'badge' => $badge,
        ]);
    }

    public function destroy($id)
    {
        $badge = Badge::findOrFail($id);
        $badge->delete();

        return response()->json([
            'message' => 'Badge deleted successfully!'
        ]);
    }
}
