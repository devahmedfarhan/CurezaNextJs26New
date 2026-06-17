<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use Illuminate\Http\Request;

class AdminChallengeController extends Controller
{
    public function index()
    {
        $challenges = Challenge::latest()->get();
        return response()->json($challenges);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|in:steps,purchase,referral,social',
            'goal_value' => 'required|integer|min:1',
            'reward_points' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'required|boolean',
        ]);

        $challenge = Challenge::create($validated);

        return response()->json([
            'message' => 'Challenge created successfully!',
            'challenge' => $challenge,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|in:steps,purchase,referral,social',
            'goal_value' => 'required|integer|min:1',
            'reward_points' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'required|boolean',
        ]);

        $challenge->update($validated);

        return response()->json([
            'message' => 'Challenge updated successfully!',
            'challenge' => $challenge,
        ]);
    }

    public function destroy($id)
    {
        $challenge = Challenge::findOrFail($id);
        $challenge->delete();

        return response()->json([
            'message' => 'Challenge deleted successfully!'
        ]);
    }
}
