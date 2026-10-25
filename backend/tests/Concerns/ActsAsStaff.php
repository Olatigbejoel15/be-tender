<?php

namespace Tests\Concerns;

use App\Models\User;
use Laravel\Sanctum\Sanctum;

trait ActsAsStaff
{
    // Sign in as a new admin; returns them so tests can check "who did it"
    protected function actingAsAdmin(): User
    {
        return tap(User::factory()->admin()->create(), fn (User $u) => Sanctum::actingAs($u));
    }

    // Sign in as a new super admin
    protected function actingAsSuperAdmin(): User
    {
        return tap(User::factory()->superAdmin()->create(), fn (User $u) => Sanctum::actingAs($u));
    }
}