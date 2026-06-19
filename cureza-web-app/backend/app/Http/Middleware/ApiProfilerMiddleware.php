<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiProfilerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only profile API routes to prevent unnecessary file writing overhead
        if (!$request->is('api/*')) {
            return $next($request);
        }

        DB::enableQueryLog();
        $startTime = microtime(true);

        $response = $next($request);

        $endTime = microtime(true);
        $durationMs = round(($endTime - $startTime) * 1000, 2);

        $queries = DB::getQueryLog();
        $queryCount = count($queries);

        $this->logPerformance($request, $response, $durationMs, $queryCount);

        return $response;
    }

    /**
     * Log the API performance details.
     */
    protected function logPerformance(Request $request, Response $response, float $durationMs, int $queryCount): void
    {
        // Don't profile the performance report endpoint itself to avoid infinite feedback loops
        if (str_contains($request->path(), 'admin/performance')) {
            return;
        }

        try {
            $logPath = storage_path('logs/api_performance.json');

            $logEntry = [
                'timestamp' => now()->toIso8601String(),
                'method' => $request->method(),
                'path' => $request->path(),
                'status' => $response->getStatusCode(),
                'duration_ms' => $durationMs,
                'query_count' => $queryCount,
                'ip' => $request->ip(),
                'user_id' => $request->user()?->id ?? null,
                'user_role' => $request->user()?->role ?? 'guest',
            ];

            $logs = [];
            if (file_exists($logPath)) {
                $content = file_get_contents($logPath);
                $logs = json_decode($content, true) ?: [];
            }

            // Prepend new entry to keep latest logs at top
            array_unshift($logs, $logEntry);

            // Limit to last 1000 records to prevent file size bloat (self-cleaning)
            if (count($logs) > 1000) {
                $logs = array_slice($logs, 0, 1000);
            }

            // Ensure directory exists
            $dir = dirname($logPath);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            file_put_contents($logPath, json_encode($logs, JSON_PRETTY_PRINT));
        } catch (\Exception $e) {
            // Silently capture exceptions to prevent disrupting API requests
            Log::error('API Profiler log failure: ' . $e->getMessage());
        }
    }
}
