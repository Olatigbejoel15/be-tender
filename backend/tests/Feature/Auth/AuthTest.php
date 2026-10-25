<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // A valid registration body; override any key
    private function registration(array $overrides = []): array
    {
        return ['name' => 'Ada Obi', 'email' => 'ada@example.com', 'password' => 'Str0ng-Pass-1', 'phone' => '08012345678', ...$overrides];
    }

    // ---------- Registering ----------

    public function test_registering_creates_a_customer_and_returns_a_token(): void
    {
        $this->postJson('/api/v1/register', $this->registration(['email' => 'Ada@Example.com']))
            ->assertCreated()
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.email', 'ada@example.com'); // Lowercased

        $user = User::where('email', 'ada@example.com')->firstOrFail();
        $this->assertSame(UserRole::Customer, $user->role);
        $this->assertTrue($user->is_active);
        $this->assertTrue(Hash::check('Str0ng-Pass-1', $user->password)); // Stored hashed
        $this->assertNotSame('Str0ng-Pass-1', $user->password);
    }

    public function test_nobody_can_register_themselves_as_staff(): void
    {
        $this->postJson('/api/v1/register', $this->registration(['role' => 'super_admin', 'is_active' => false]))->assertCreated();

        $user = User::where('email', 'ada@example.com')->firstOrFail();
        $this->assertSame(UserRole::Customer, $user->role); // The extra field was ignored
        $this->assertTrue($user->is_active);
    }

    public function test_registration_requires_the_basics(): void
    {
        $this->postJson('/api/v1/register', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_a_short_password_is_rejected(): void
    {
        $this->postJson('/api/v1/register', $this->registration(['password' => 'short']))
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_an_email_can_only_register_once(): void
    {
        User::factory()->create(['email' => 'ada@example.com']);

        $this->postJson('/api/v1/register', $this->registration())->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    // ---------- Logging in ----------

    public function test_a_customer_can_log_in_whatever_the_email_capitalisation(): void
    {
        User::factory()->create(['email' => 'ada@example.com']); // Factory password is "password"

        $this->postJson('/api/v1/login', ['email' => 'ADA@Example.com', 'password' => 'password'])
            ->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_a_wrong_password_and_an_unknown_email_get_the_same_message(): void
    {
        User::factory()->create(['email' => 'ada@example.com']);

        $wrongPassword = $this->postJson('/api/v1/login', ['email' => 'ada@example.com', 'password' => 'nope'])
            ->assertUnprocessable()->json('errors.email.0');
        $unknownEmail = $this->postJson('/api/v1/login', ['email' => 'ghost@example.com', 'password' => 'nope'])
            ->assertUnprocessable()->json('errors.email.0');

        $this->assertSame($wrongPassword, $unknownEmail); // Attackers can't tell which emails exist
    }

    public function test_a_deactivated_account_cannot_log_in(): void
    {
        User::factory()->inactive()->create(['email' => 'gone@example.com']);

        $this->postJson('/api/v1/login', ['email' => 'gone@example.com', 'password' => 'password']) // Right password
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email'])
            ->assertJsonMissingPath('token');

        $this->assertDatabaseCount('personal_access_tokens', 0); // No token was issued
    }

    public function test_login_is_throttled_after_five_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/login', ['email' => 'ada@example.com', 'password' => 'wrong'])->assertUnprocessable();
        }

        $this->postJson('/api/v1/login', ['email' => 'ada@example.com', 'password' => 'wrong'])->assertStatus(429);
    }

    // ---------- Staying logged in ----------

    public function test_me_needs_a_token_and_never_exposes_the_password(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/me')->assertOk()->assertJsonPath('user.email', $user->email)->assertJsonMissingPath('user.password');
    }

    public function test_logging_out_ends_only_that_device(): void
    {
        User::factory()->create(['email' => 'ada@example.com']);
        $phone  = $this->postJson('/api/v1/login', ['email' => 'ada@example.com', 'password' => 'password'])->json('token');
        $laptop = $this->postJson('/api/v1/login', ['email' => 'ada@example.com', 'password' => 'password'])->json('token');

        $this->withToken($phone)->postJson('/api/v1/logout')->assertNoContent();

        $this->app['auth']->forgetGuards(); // The test app remembers the last user between requests; forget it
        $this->withToken($phone)->getJson('/api/v1/me')->assertUnauthorized(); // That token is dead

        $this->app['auth']->forgetGuards();
        $this->withToken($laptop)->getJson('/api/v1/me')->assertOk();          // The other device stays signed in
    }
}