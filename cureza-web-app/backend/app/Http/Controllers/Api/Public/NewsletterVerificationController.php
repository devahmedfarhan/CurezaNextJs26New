<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Communication\NewsletterService;
use Exception;

class NewsletterVerificationController extends Controller
{
    protected $newsletterService;

    public function __construct(NewsletterService $newsletterService)
    {
        $this->newsletterService = $newsletterService;
    }

    /**
     * Verify double opt-in token.
     */
    public function verify(Request $request)
    {
        $token = $request->query('token');
        if (empty($token)) {
            return response()->json(['message' => 'Verification token is required.'], 400);
        }

        $subscriber = $this->newsletterService->verifyOptIn($token);

        if ($subscriber) {
            // Redirect to a gorgeous React/Next.js page showing verification success
            $redirectUrl = config('app.url', 'http://localhost:3000') . '/newsletter/verify?status=success&email=' . urlencode($subscriber->email);
            return redirect()->away($redirectUrl);
        }

        // Return token invalid error redirect
        $errorUrl = config('app.url', 'http://localhost:3000') . '/newsletter/verify?status=error';
        return redirect()->away($errorUrl);
    }

    /**
     * Public newsletter subscribe endpoint (Double opt-in by default).
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
        ]);

        try {
            $email = $request->input('email');
            $name = $request->input('name');

            // Set tags to distinguish organic footer subscribers
            $this->newsletterService->subscribe($email, $name, ['organic', 'footer'], ['newsletter'], true);

            return response()->json([
                'message' => 'Subscription request received. Please check your email to verify your subscription.'
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to process subscription: ' . $e->getMessage()], 500);
        }
    }
}
