<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Order;
use App\Observers\OrderObserver;

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
        // Register Order Observer for automatic commission calculation
        Order::observe(OrderObserver::class);

        // Automatically populate IP and User Agent on token creation (A.7)
        \Laravel\Sanctum\PersonalAccessToken::creating(function ($token) {
            $token->ip_address = request()->ip();
            $token->user_agent = request()->userAgent();
        });
    }
}
