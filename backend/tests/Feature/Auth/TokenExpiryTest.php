<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TokenExpiryTest extends TestCase
{
    use RefreshDatabase;

    // Logs in through the real endpoint and returns the token
    private function loginAs(User $user): string
    {
        return $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->json('token');
    }

    // Laravel remembers the user between requests in one test, so forget it before each check
    private function meStatus(string $token): int
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($token)->getJson('/api/v1/me')->status();
    }

    public function test_customer_token_works_for_29_days_then_expires(): void
    {
        $token = $this->loginAs(User::factory()->create());

        $this->travel(29)->days();
        $this->assertSame(200, $this->meStatus($token)); // still valid

        $this->travel(2)->days(); // now 31 days in
        $this->assertSame(401, $this->meStatus($token)); // expired
    }

    public function test_staff_token_expires_after_12_hours(): void
    {
        $token = $this->loginAs(User::factory()->create(['role' => 'admin']));

        $this->travel(11)->hours();
        $this->assertSame(200, $this->meStatus($token));

        $this->travel(2)->hours(); // 13 hours in
        $this->assertSame(401, $this->meStatus($token));
    }
}