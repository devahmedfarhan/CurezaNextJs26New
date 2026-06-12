<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecureCookieMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Handle Logout
        if (str_contains($request->getPathInfo(), 'logout')) {
            $response->headers->setCookie(cookie()->forget('token'));
            return $response;
        }

        // Only process JSON responses
        if ($response instanceof \Illuminate\Http\JsonResponse) {
            $data = $response->getData(true);
            $token = $data['access_token'] ?? $data['token'] ?? null;

            if ($token && is_string($token)) {
                $cookie = cookie(
                    'token',
                    $token,
                    14 * 24 * 60, // 14 days
                    '/',
                    null,
                    true, // secure
                    true, // httponly
                    false, // raw
                    'Strict' // samesite
                );
                $response->headers->setCookie($cookie);
            }
        }

        return $response;
    }
}
