<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\ActsAsStaff;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase, ActsAsStaff;

    private const SHARED = ['/api/v1/admin/orders', '/api/v1/admin/stock/low'];            // Any active staff
    private const SUPER  = ['/api/v1/admin/staff', '/api/v1/admin/audit-logs'];           // Super admin only

    public function test_anonymous_visitors_are_turned_away_everywhere(): void
    {
        foreach ([...self::SHARED, ...self::SUPER] as $url) {
            $this->getJson($url)->assertUnauthorized(); // No token = 401
        }
    }

    public function test_customers_cannot_use_any_admin_endpoint(): void
    {
        Sanctum::actingAs(User::factory()->create()); // A plain shopper with a valid token

        foreach ([...self::SHARED, ...self::SUPER] as $url) {
            $this->getJson($url)->assertForbidden();
        }
    }

    public function test_deactivated_staff_are_locked_out_even_with_a_valid_token(): void
    {
        Sanctum::actingAs(User::factory()->admin()->inactive()->create());
        $this->getJson('/api/v1/admin/orders')->assertForbidden();

        Sanctum::actingAs(User::factory()->superAdmin()->inactive()->create());
        $this->getJson('/api/v1/admin/staff')->assertForbidden();
    }

    public function test_an_admin_can_use_the_shared_screens(): void
    {
        $this->actingAsAdmin();

        foreach (self::SHARED as $url) {
            $this->getJson($url)->assertOk();
        }
    }

    public function test_an_admin_cannot_manage_staff_or_read_the_audit_log(): void
    {
        $this->actingAsAdmin();

        foreach (self::SUPER as $url) {
            $this->getJson($url)->assertForbidden();
        }

        $this->postJson('/api/v1/admin/staff', ['email' => 'x@example.com', 'role' => 'admin'])->assertForbidden();
        $this->patchJson('/api/v1/admin/staff/1', ['role' => 'customer'])->assertForbidden();
    }

    public function test_a_super_admin_can_use_everything(): void
    {
        $this->actingAsSuperAdmin();

        foreach ([...self::SHARED, ...self::SUPER] as $url) {
            $this->getJson($url)->assertOk();
        }
    }
}