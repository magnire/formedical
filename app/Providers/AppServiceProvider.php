<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Illuminate\Mail\Markdown;

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
        // Register mail components namespace
        Blade::componentNamespace('Illuminate\\Mail\\Resources\\Views\\Components', 'mail');

        // Register custom mail components path if needed
        $this->loadViewsFrom(
            resource_path('views/vendor/mail'), 
            'mail'
        );
    }
}
