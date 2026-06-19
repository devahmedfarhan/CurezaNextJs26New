<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->api(append: [
            'throttle:global',
            \App\Http\Middleware\SecureCookieMiddleware::class,
            \App\Http\Middleware\AuditLogMiddleware::class,
            \App\Http\Middleware\ApiProfilerMiddleware::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'honeypot' => \App\Http\Middleware\HoneypotMiddleware::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            'api/*', // Force all API routes to be stateless (no CSRF)
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                $status = 500;
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                    $status = 422;
                    return response()->json([
                        'message' => $e->getMessage(),
                        'errors' => $e->errors(),
                    ], $status);
                } elseif ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    $status = 403;
                    \Illuminate\Support\Facades\Log::warning("Policy authorization failure on " . $request->getRequestUri(), [
                        'ip' => $request->ip(),
                        'user_id' => $request->user()?->id,
                        'message' => $e->getMessage(),
                    ]);
                } elseif ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    $status = 401;
                    \Illuminate\Support\Facades\Log::warning("Unauthenticated request to " . $request->getRequestUri(), [
                        'ip' => $request->ip(),
                    ]);
                } elseif ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    $status = 404;
                }

                // Intrusion Alert tracking (Section 9)
                if ($status === 401 || $status === 403) {
                    $ip = $request->ip();
                    $cacheKey = "auth_failures_spike_" . $ip;
                    $count = (int)\Illuminate\Support\Facades\Cache::get($cacheKey, 0) + 1;
                    \Illuminate\Support\Facades\Cache::put($cacheKey, $count, now()->addMinutes(5));

                    if ($count === 10) {
                        \Illuminate\Support\Facades\Log::critical("Intrusion Alert: 10+ failed API authorization checks from IP: " . $ip);
                        if (config('logging.channels.slack.url')) {
                            try {
                                \Illuminate\Support\Facades\Log::channel('slack')->critical("Intrusion Alert: 10+ failed API authorization checks from IP: " . $ip);
                            } catch (\Throwable $err) {
                                // ignore
                            }
                        }
                    }
                }

                $response = [
                    'message' => ($status === 500 && !config('app.debug'))
                        ? 'Server Error.'
                        : $e->getMessage(),
                ];

                if (config('app.debug')) {
                    $response['exception'] = get_class($e);
                    $response['file'] = $e->getFile();
                    $response['line'] = $e->getLine();
                    $response['trace'] = collect($e->getTrace())->take(10);
                }

                return response()->json($response, $status);
            }
        });
    })->create();
