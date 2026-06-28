<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\SocialSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SocialSubmissionController extends Controller
{
    /**
     * Get a list of the customer's social submissions.
     */
    public function index(Request $request)
    {
        $submissions = SocialSubmission::where('customer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $submissions
        ]);
    }

    /**
     * Submit a new social media review link.
     */
    public function store(Request $request)
    {
        $request->validate([
            'platform' => 'required|in:instagram,youtube',
            'link' => 'required|url',
            'content_type' => 'required|in:photo,video,both',
        ]);

        $link = trim($request->link);

        // Check if the link has already been submitted by anyone
        $exists = SocialSubmission::where('link', $link)->exists();
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This review link has already been submitted.'
            ], 422);
        }

        // Create the submission
        $submission = SocialSubmission::create([
            'customer_id' => Auth::id(),
            'platform' => $request->platform,
            'link' => $link,
            'content_type' => $request->content_type,
            'status' => 'pending',
            'points_awarded' => 0,
            'xp_awarded' => 0,
            'bonus_type' => 'none',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your review link has been submitted successfully for moderation.',
            'data' => $submission
        ], 201);
    }
}
