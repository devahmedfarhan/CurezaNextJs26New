<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SocialSubmission;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SocialSubmissionController extends Controller
{
    /**
     * List all social submissions for moderation.
     */
    public function index(Request $request)
    {
        $submissions = SocialSubmission::query()
            ->with(['customer:id,name,email', 'moderator:id,name'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->platform, function ($query, $platform) {
                $query->where('platform', $platform);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $submissions
        ]);
    }

    /**
     * Approve or reject a social review submission and distribute rewards/bonuses.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'views_count' => 'nullable|integer|min:0',
            'likes_count' => 'nullable|integer|min:0',
            'bonus_type' => 'nullable|in:none,points,coupon,cash,free_product',
            'bonus_details' => 'nullable|string|max:1000',
        ]);

        $submission = SocialSubmission::findOrFail($id);

        if ($submission->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This submission has already been moderated.'
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, $submission) {
                $status = $request->status;
                $pointsAwarded = 0;
                $xpAwarded = 0;

                if ($status === 'approved') {
                    // 1. Get standard loyalty rules
                    $rules = GamificationService::getRules();
                    if ($submission->platform === 'instagram') {
                        $xpAwarded = $rules['xp_instagram_review'] ?? 500;
                        $pointsAwarded = $rules['points_instagram_review'] ?? 250;
                    } else { // youtube
                        $xpAwarded = $rules['xp_youtube_review'] ?? 1000;
                        $pointsAwarded = $rules['points_youtube_review'] ?? 500;
                    }

                    // 2. Add extra points if viral bonus is 'points'
                    $bonusPoints = 0;
                    if ($request->bonus_type === 'points' && is_numeric($request->bonus_details)) {
                        $bonusPoints = (int) $request->bonus_details;
                    }

                    $totalPoints = $pointsAwarded + $bonusPoints;
                    $totalXP = $xpAwarded; // standard XP remains flat

                    // 3. Credit points/XP to the customer's wallet
                    GamificationService::adjustXPAndPoints(
                        $submission->customer,
                        $totalXP,
                        $totalPoints,
                        "Approved " . ucfirst($submission->platform) . " review link submission"
                    );

                    // 4. Save points/XP details on the submission row
                    $submission->points_awarded = $totalPoints;
                    $submission->xp_awarded = $totalXP;
                }

                // Update submission details
                $submission->status = $status;
                $submission->views_count = $request->views_count ?? 0;
                $submission->likes_count = $request->likes_count ?? 0;
                $submission->bonus_type = $request->bonus_type ?? 'none';
                $submission->bonus_details = $request->bonus_details;
                $submission->moderated_by = Auth::id();
                $submission->moderated_at = now();
                $submission->save();
            });

            return response()->json([
                'success' => true,
                'message' => 'Submission moderated successfully',
                'data' => $submission->load(['customer:id,name,email', 'moderator:id,name'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error moderating submission: ' . $e->getMessage()
            ], 400);
        }
    }
}
