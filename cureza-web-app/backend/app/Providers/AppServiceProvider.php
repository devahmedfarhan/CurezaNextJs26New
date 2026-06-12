<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Order;
use App\Observers\OrderObserver;
use App\Models\Product;
use App\Policies\ProductPolicy;
use App\Models\Payout;
use App\Policies\PayoutPolicy;
use App\Models\SellerProfile;
use App\Policies\SellerProfilePolicy;
use App\Policies\OrderPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Payout::class, PayoutPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(SellerProfile::class, SellerProfilePolicy::class);

        // Register Order Observer for automatic commission calculation
        Order::observe(OrderObserver::class);

        // Automatically populate IP and User Agent on token creation (A.7)
        \Laravel\Sanctum\PersonalAccessToken::creating(function ($token) {
            $token->ip_address = request()->ip();
            $token->user_agent = request()->userAgent();
        });

        // Configure Rate Limiters (Section 3.1)
        \Illuminate\Support\Facades\RateLimiter::for('global', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('sensitive', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('public-catalog', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
        });

        // Access token from cookie fallback (A.6)
        \Laravel\Sanctum\Sanctum::getAccessTokenFromRequestUsing(function (\Illuminate\Http\Request $request) {
            $token = $request->header('Authorization');
            if ($token) {
                return str_starts_with($token, 'Bearer ') ? substr($token, 7) : $token;
            }
            return $request->cookie('token');
        });
    }
}
