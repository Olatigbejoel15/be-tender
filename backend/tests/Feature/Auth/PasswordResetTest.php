<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase; // fresh in-memory database per test

    // A valid reset request body for the given user and token
    private function resetBody(User $user, string $token, string $password = 'new-password-1'): array
    {
        return [
            'email' => $user->email,
            'token' => $token,
            'password' => $password,
            'password_confirmation' => $password,
        ];
    }

    public function test_forgot_sends_a_reset_notification_to_a_real_account(): void
    {
        Notification::fake(); // capture notifications instead of sending
        $user = User::factory()->create();

        $this->postJson('/api/v1/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_forgot_gives_the_same_answer_for_an_unknown_email(): void
    {
        Notification::fake();

        $known = User::factory()->create();
        $a = $this->postJson('/api/v1/forgot-password', ['email' => $known->email]);
        $b = $this->postJson('/api/v1/forgot-password', ['email' => 'nobody@example.com']);

        $b->assertOk();
        $this->assertSame($a->json('message'), $b->json('message')); // nothing reveals who has an account
        Notification::assertSentToTimes($known, ResetPassword::class, 1);
    }

    public function test_forgot_email_is_matched_case_insensitively(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/v1/forgot-password', ['email' => strtoupper($user->email)])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_forgot_requires_a_valid_email(): void
    {
        $this->postJson('/api/v1/forgot-password', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_reset_link_points_at_the_frontend_page(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/v1/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($n) use ($user) {
            $url = $n->toMail($user)->actionUrl; // the button link in the email
            return str_starts_with($url, config('app.frontend_url') . '/reset-password?token=' . $n->token)
                && str_contains($url, 'email=');
        });
    }

    public function test_reset_changes_the_password(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user); // same token the email would carry

        $this->postJson('/api/v1/reset-password', $this->resetBody($user, $token))->assertOk();

        $this->assertTrue(Hash::check('new-password-1', $user->fresh()->password));
    }

    public function test_a_reset_token_works_only_once(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/v1/reset-password', $this->resetBody($user, $token))->assertOk();
        $this->postJson('/api/v1/reset-password', $this->resetBody($user, $token, 'another-pass-2'))
            ->assertStatus(422); // token was consumed

        $this->assertTrue(Hash::check('new-password-1', $user->fresh()->password)); // second attempt changed nothing
    }

    public function test_a_wrong_token_is_rejected(): void
    {
        $user = User::factory()->create();
        $oldHash = $user->password;

        $this->postJson('/api/v1/reset-password', $this->resetBody($user, 'wrong-token'))
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');

        $this->assertSame($oldHash, $user->fresh()->password); // password untouched
    }

    public function test_an_expired_token_is_rejected(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->travel(61)->minutes(); // the link lasts 60

        $this->postJson('/api/v1/reset-password', $this->resetBody($user, $token))->assertStatus(422);
    }

    public function test_reset_signs_out_every_existing_session(): void
    {
        $user = User::factory()->create();
        $user->createToken('phone'); // a logged-in device
        $user->createToken('laptop');
        $token = Password::createToken($user);

        $this->postJson('/api/v1/reset-password', $this->resetBody($user, $token))->assertOk();

        $this->assertSame(0, $user->tokens()->count()); // old logins are dead
    }

    public function test_the_new_password_works_for_login_and_the_old_one_does_not(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password-1')]);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/reset-password', $this->resetBody($user, $token))->assertOk();

        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'new-password-1'])->assertOk();
        $this->app['auth']->forgetGuards(); // fresh request state
        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'old-password-1'])->assertStatus(422);
    }

    public function test_password_rules_are_enforced(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/v1/reset-password', $this->resetBody($user, $token, 'short')) // under 8 chars
            ->assertStatus(422)->assertJsonValidationErrors('password');

        $body = $this->resetBody($user, $token);
        $body['password_confirmation'] = 'does-not-match'; // confirmation differs
        $this->postJson('/api/v1/reset-password', $body)
            ->assertStatus(422)->assertJsonValidationErrors('password');
    }
}