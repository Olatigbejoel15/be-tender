<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\ActsAsStaff;
use Tests\TestCase;

class StaffManagementTest extends TestCase
{
    use RefreshDatabase, ActsAsStaff;

    private User $actor; // The signed-in super admin

    protected function setUp(): void
    {
        parent::setUp();
        $this->actor = $this->actingAsSuperAdmin();
    }

    private function patchStaff(User $user, array $changes)
    {
        return $this->patchJson("/api/v1/admin/staff/{$user->id}", $changes);
    }

    // ---------- Listing ----------

    public function test_the_list_shows_staff_only(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();

        $response = $this->getJson('/api/v1/admin/staff')->assertOk()->assertJsonMissingPath('data.0.password');
        $emails = collect($response->json('data'))->pluck('email');

        $this->assertTrue($emails->contains($admin->email));
        $this->assertTrue($emails->contains($this->actor->email));
        $this->assertFalse($emails->contains($customer->email));
    }

    // ---------- Adding staff ----------

    public function test_a_brand_new_admin_can_be_created_and_can_then_log_in(): void
    {
        $this->postJson('/api/v1/admin/staff', [
            'name' => 'New Admin', 'email' => 'newbie@example.com', 'password' => 'Str0ng-Pass-1', 'role' => 'admin',
        ])->assertCreated()->assertJsonPath('data.role', 'admin')->assertJsonPath('data.isActive', true);

        $user = User::where('email', 'newbie@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('Str0ng-Pass-1', $user->password));
        $this->assertDatabaseHas('audit_logs', ['action' => 'staff.created', 'subject_id' => $user->id, 'user_id' => $this->actor->id]);

        $this->app['auth']->forgetGuards(); // Now behave as the new person
        $this->postJson('/api/v1/login', ['email' => 'newbie@example.com', 'password' => 'Str0ng-Pass-1'])
            ->assertOk()->assertJsonStructure(['token']);
    }

    public function test_a_new_account_needs_a_name_and_password(): void
    {
        $this->postJson('/api/v1/admin/staff', ['email' => 'newbie@example.com', 'role' => 'admin'])
            ->assertUnprocessable()->assertJsonValidationErrors(['name']);

        $this->assertDatabaseMissing('users', ['email' => 'newbie@example.com']);
    }

    public function test_an_existing_customer_is_promoted_instead_of_duplicated(): void
    {
        $customer = User::factory()->create(['email' => 'shopper@example.com']);

        $this->postJson('/api/v1/admin/staff', ['email' => 'shopper@example.com', 'role' => 'admin'])
            ->assertOk() // 200 = promoted, not 201
            ->assertJsonPath('data.role', 'admin');

        $this->assertSame(UserRole::Admin, $customer->fresh()->role);
        $this->assertDatabaseCount('users', 2); // The actor and the customer: no new row
        $this->assertDatabaseHas('audit_logs', ['action' => 'staff.promoted', 'subject_id' => $customer->id]);
    }

    public function test_promoting_matches_the_email_ignoring_case(): void
    {
        $customer = User::factory()->create(['email' => 'shopper@example.com']);

        $this->postJson('/api/v1/admin/staff', ['email' => 'Shopper@Example.com', 'role' => 'admin'])->assertOk();

        $this->assertSame(UserRole::Admin, $customer->fresh()->role);
    }

    public function test_staff_emails_are_stored_in_lowercase(): void
    {
        $this->postJson('/api/v1/admin/staff', [
            'name' => 'Mixed Case', 'email' => 'Mixed.Case@Example.com', 'password' => 'Str0ng-Pass-1', 'role' => 'admin',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'mixed.case@example.com']); // Logins lowercase the email, so this must match
    }

    public function test_someone_already_on_staff_cannot_be_added_again(): void
    {
        $admin = User::factory()->admin()->create();

        $this->postJson('/api/v1/admin/staff', ['email' => $admin->email, 'role' => 'super_admin'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertSame(UserRole::Admin, $admin->fresh()->role); // Unchanged
    }

    public function test_only_staff_roles_can_be_assigned_when_adding(): void
    {
        foreach (['customer', 'owner'] as $role) {
            $this->postJson('/api/v1/admin/staff', ['email' => 'x@example.com', 'role' => $role])
                ->assertUnprocessable()->assertJsonValidationErrors(['role']);
        }
    }

    // ---------- Changing staff ----------

    public function test_changing_a_role_is_saved_and_audited_with_before_and_after(): void
    {
        $admin = User::factory()->admin()->create();

        $this->patchStaff($admin, ['role' => 'super_admin'])->assertOk()->assertJsonPath('data.role', 'super_admin');

        $log = AuditLog::where('action', 'staff.updated')->firstOrFail();
        $this->assertSame(['role' => ['from' => 'admin', 'to' => 'super_admin']], $log->changes);
        $this->assertSame($this->actor->id, $log->user_id);
    }

    public function test_a_super_admin_can_demote_another_super_admin(): void
    {
        $other = User::factory()->superAdmin()->create();

        $this->patchStaff($other, ['role' => 'admin'])->assertOk(); // The actor is still there, so this is safe
        $this->assertSame(UserRole::Admin, $other->fresh()->role);
    }

    public function test_removing_someone_from_staff_makes_them_a_customer_with_no_admin_access(): void
    {
        $admin = User::factory()->admin()->create();

        $this->patchStaff($admin, ['role' => 'customer'])->assertOk();
        $this->assertSame(UserRole::Customer, $admin->fresh()->role);

        Sanctum::actingAs($admin->fresh()); // Now as the ex-admin
        $this->getJson('/api/v1/admin/orders')->assertForbidden();
    }

    public function test_deactivating_revokes_their_tokens_immediately(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->createToken('web');
        $this->assertSame(1, $admin->tokens()->count());

        $this->patchStaff($admin, ['is_active' => false])->assertOk()->assertJsonPath('data.isActive', false);

        $this->assertSame(0, $admin->tokens()->count()); // Logged out everywhere, right now
    }

    public function test_a_deactivated_member_can_be_reactivated(): void
    {
        $admin = User::factory()->admin()->inactive()->create();

        $this->patchStaff($admin, ['is_active' => true])->assertOk()->assertJsonPath('data.isActive', true);
    }

    public function test_an_update_that_changes_nothing_is_not_audited(): void
    {
        $admin = User::factory()->admin()->create();

        $this->patchStaff($admin, ['role' => 'admin'])->assertOk(); // Already an admin

        $this->assertDatabaseMissing('audit_logs', ['action' => 'staff.updated']);
    }

    // ---------- Rules ----------

    public function test_you_cannot_change_your_own_role_or_status(): void
    {
        $this->patchStaff($this->actor, ['role' => 'admin'])->assertUnprocessable()->assertJsonValidationErrors(['user']);
        $this->patchStaff($this->actor, ['is_active' => false])->assertUnprocessable()->assertJsonValidationErrors(['user']);

        $this->assertSame(UserRole::SuperAdmin, $this->actor->fresh()->role);
        $this->assertTrue($this->actor->fresh()->is_active);
    }

    public function test_unknown_ids_and_customers_are_404(): void
    {
        $customer = User::factory()->create();

        $this->patchJson('/api/v1/admin/staff/999999', ['role' => 'admin'])->assertNotFound();
        $this->patchStaff($customer, ['role' => 'admin'])->assertNotFound(); // Promote through "Add staff", not here
    }

    public function test_an_empty_or_invalid_update_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $this->patchStaff($admin, [])->assertUnprocessable();
        $this->patchStaff($admin, ['role' => 'owner'])->assertUnprocessable()->assertJsonValidationErrors(['role']);
    }
}