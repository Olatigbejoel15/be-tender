<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Notifications\ResetPassword;


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

        // Reset emails link to the Next.js page, not a Laravel route
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return config('app.frontend_url')
                . '/reset-password?token=' . $token
                . '&email=' . urlencode($user->getEmailForPasswordReset()); // email comes along so the form can submit it
        });
    }
}
