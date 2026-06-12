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
    }
}
