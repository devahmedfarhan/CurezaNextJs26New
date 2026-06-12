<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\UserChallenge;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function index(Request $request)
    {
        $activeChallenges = Challenge::where('is_active', true)
            ->where('end_date', '>=', now())
            ->get();

        $userProgress = UserChallenge::where('user_id', $request->user()->id)
            ->whereIn('challenge_id', $activeChallenges->pluck('id'))
            ->get()
            ->keyBy('challenge_id');

        $challenges = $activeChallenges->map(function ($challenge) use ($userProgress) {
            $progress = $userProgress->get($challenge->id);
            return [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'description' => $challenge->description,
                'goal_value' => $challenge->goal_value,
                'reward_points' => $challenge->reward_points,
                'end_date' => $challenge->end_date,
                'current_value' => $progress ? $progress->current_value : 0,
                'status' => $progress ? $progress->status : 'not_started', // not_started, in_progress, completed
            ];
        });

        return response()->json($challenges);
    }

    public function join(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);
        
        UserChallenge::firstOrCreate(
            ['user_id' => $request->user()->id, 'challenge_id' => $id],
            ['current_value' => 0, 'status' => 'in_progress']
        );

        return response()->json(['message' => 'Joined challenge successfully']);
    }
}
