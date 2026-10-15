<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
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
                // Only an active super admin may manage staff (use: ->middleware('can:manage-staff'))
        Gate::define('manage-staff', fn (User $user) => $user->isSuperAdmin() && $user->is_active);
    }
}
