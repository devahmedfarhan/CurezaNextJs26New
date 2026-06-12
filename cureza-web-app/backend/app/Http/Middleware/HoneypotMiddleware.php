<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HoneypotMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check honeypot fields
        $honeypotFields = [
            'website_hp',
            'spamtrap_email',
        ];

        foreach ($honeypotFields as $field) {
            if ($request->has($field) && !empty($request->input($field))) {
                // Return dummy response to quiet/trick the bot
                return response()->json([
                    'success' => true,
                    'message' => 'Submission received successfully.'
                ], 200);
            }
        }

        return $next($request);
    }
}
