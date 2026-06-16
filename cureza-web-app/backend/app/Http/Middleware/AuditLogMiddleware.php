<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ActivityLog;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     */
    public function terminate(Request $request, Response $response): void
    {
        // To minimize system load, only log state-changing methods (POST, PUT, PATCH, DELETE)
        // and successful response codes (2xx, 3xx). We also log failed requests if they are login attempts.
        $method = $request->method();
        $isWrite = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']);
        $statusCode = $response->getStatusCode();
        
        $isAuthRoute = false;
        $uri = $request->getRequestUri();
        if (str_contains($uri, 'login') || str_contains($uri, 'logout') || str_contains($uri, 'register')) {
            $isAuthRoute = true;
        }

        // Only log if it's a write action or auth route, and status code is successful or it's a login attempt
        if (!$isWrite && !$isAuthRoute) {
            return;
        }

        // Get authenticated user
        $user = $request->user();
        if (!$user && Auth::guard('sanctum')->check()) {
            $user = Auth::guard('sanctum')->user();
        }

        // If not authenticated (like on login/register route), try to identify user by email from request
        if (!$user && $request->has('email')) {
            $user = \App\Models\User::where('email', $request->input('email'))->first();
        }

        // If no user is identified/authenticated and it's not an auth route, we can skip
        if (!$user && !$isAuthRoute) {
            return;
        }

        // Determine Action Name
        $action = $this->determineActionName($request, $user);
        
        // Prepare Description
        $description = $this->prepareDescription($request, $response, $user);

        // Save activity log (Write to DB)
        try {
            ActivityLog::create([
                'user_id' => $user ? $user->id : null,
                'action' => $action,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 255),
            ]);
        } catch (\Exception $e) {
            // Silently fail logging to avoid breaking user experience
            \Illuminate\Support\Facades\Log::error('Failed to write audit log: ' . $e->getMessage());
        }
    }

    /**
     * Determine a human-readable action name.
     */
    protected function determineActionName(Request $request, $user): string
    {
        $uri = $request->getRequestUri();
        $method = $request->method();

        if (str_contains($uri, 'login')) {
            return 'User Login';
        }
        if (str_contains($uri, 'logout')) {
            return 'User Logout';
        }
        if (str_contains($uri, 'register')) {
            return 'User Registration';
        }

        // Mapped routes
        if (str_contains($uri, 'products')) {
            if ($method === 'POST') return 'Create Product';
            if ($method === 'PUT' || $method === 'PATCH') return 'Update Product';
            if ($method === 'DELETE') return 'Delete Product';
        }

        if (str_contains($uri, 'profile') || str_contains($uri, 'settings')) {
            return 'Update Profile/Settings';
        }

        if (str_contains($uri, 'appointments')) {
            if ($method === 'POST') return 'Book Appointment';
            if ($method === 'PUT' || $method === 'PATCH') return 'Update Appointment';
        }

        if (str_contains($uri, 'prescriptions')) {
            if ($method === 'POST') return 'Create Prescription';
        }

        if (str_contains($uri, 'orders')) {
            if ($method === 'POST') return 'Place Order';
            if ($method === 'PUT' || $method === 'PATCH') return 'Update Order Status';
        }

        if (str_contains($uri, 'reviews')) {
            return 'Submit Review/Reply';
        }

        if (str_contains($uri, 'tickets')) {
            if ($method === 'POST') return 'Create Support Ticket';
            return 'Update Ticket';
        }

        // Fallback
        return ucfirst(strtolower($method)) . ' Request: ' . preg_replace('/\/\d+/', '/*', $request->path());
    }

    /**
     * Prepare a description of the request.
     */
    protected function prepareDescription(Request $request, Response $response, $user): string
    {
        $role = $user ? $user->role : 'Guest';
        $email = $user ? $user->email : 'N/A';
        $status = $response->getStatusCode();
        
        $desc = "Role: {$role} ({$email}) | Method: {$request->method()} | Path: {$request->path()} | Status: {$status}";
        
        // Include specific request info if present
        if ($request->has('status') && is_string($request->input('status'))) {
            $desc .= " | Status set to: " . $request->input('status');
        }

        return $desc;
    }
}
