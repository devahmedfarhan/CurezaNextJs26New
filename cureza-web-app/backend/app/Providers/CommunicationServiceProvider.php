<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class CommunicationServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind Repository Interfaces
        $this->app->bind(
            \App\Repositories\Communication\SmtpRepositoryInterface::class,
            \App\Repositories\Communication\Eloquent\SmtpRepository::class
        );
        $this->app->bind(
            \App\Repositories\Communication\EmailTemplateRepositoryInterface::class,
            \App\Repositories\Communication\Eloquent\EmailTemplateRepository::class
        );
        $this->app->bind(
            \App\Repositories\Communication\EmailLogRepositoryInterface::class,
            \App\Repositories\Communication\Eloquent\EmailLogRepository::class
        );
        $this->app->bind(
            \App\Repositories\Communication\SubscriberRepositoryInterface::class,
            \App\Repositories\Communication\Eloquent\SubscriberRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register OrderObserver
        if (class_exists(\App\Models\Order::class) && class_exists(\App\Observers\OrderObserver::class)) {
            \App\Models\Order::observe(\App\Observers\OrderObserver::class);
        }
    }
}
