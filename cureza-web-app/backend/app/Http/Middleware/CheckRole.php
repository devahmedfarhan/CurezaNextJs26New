<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! $request->user()) {
            abort(401, 'Unauthenticated.');
        }

        if (in_array($request->user()->role, $roles)) {
            return $next($request);
        }
        
        // Super Admin override (if checking for admin)
        if (in_array('admin', $roles) && $request->user()->role === 'super_admin') {
             return $next($request);
        }

        abort(403, 'Unauthorized. Role required: ' . implode(', ', $roles));
    }
}
