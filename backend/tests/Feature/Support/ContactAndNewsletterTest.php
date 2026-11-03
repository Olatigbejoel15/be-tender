<?php

namespace Tests\Feature\Support;

use App\Mail\ContactMessageMail;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactAndNewsletterTest extends TestCase
{
    use RefreshDatabase; // fresh in-memory database per test

    private function contactBody(array $over = []): array
    {
        return array_merge([
            'name' => 'Ada Obi', 'email' => 'Ada@Example.com', 'phone' => '08012345678',
            'topic' => 'Sizing advice', 'message' => 'Which size should I pick?',
        ], $over);
    }

    // ---- Contact ----

    public function test_a_message_is_saved_and_the_team_is_emailed(): void
    {
        Mail::fake();
        config(['shop.staff_alert_email' => 'team@example.com']);

        $this->postJson('/api/v1/contact', $this->contactBody())->assertOk();

        $this->assertDatabaseHas('contact_messages', ['name' => 'Ada Obi', 'email' => 'ada@example.com']); // lowercased
        Mail::assertQueued(ContactMessageMail::class, fn ($m) => $m->hasTo('team@example.com') && $m->contact->topic === 'Sizing advice');
    }

    public function test_a_message_is_still_saved_when_no_team_address_is_set(): void
    {
        Mail::fake();
        config(['shop.staff_alert_email' => null]);

        $this->postJson('/api/v1/contact', $this->contactBody())->assertOk();

        $this->assertSame(1, ContactMessage::count());
        Mail::assertNothingQueued();
    }

    public function test_the_email_escapes_html_the_visitor_typed(): void
    {
        Mail::fake();
        config(['shop.staff_alert_email' => 'team@example.com']);

        $this->postJson('/api/v1/contact', $this->contactBody(['message' => '<b>hello</b> there friend']))->assertOk();

        Mail::assertQueued(ContactMessageMail::class, function ($mail) {
            $mail->assertDontSeeInHtml('<b>hello</b>', false); // shown as text, not markup
            return true;
        });
    }

    public function test_required_fields_are_enforced(): void
    {
        $this->postJson('/api/v1/contact', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'topic', 'message']);
    }

    public function test_a_bad_email_or_tiny_message_is_rejected(): void
    {
        $this->postJson('/api/v1/contact', $this->contactBody(['email' => 'nope', 'message' => 'hi']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'message']);
    }

    public function test_a_filled_honeypot_looks_successful_but_saves_nothing(): void
    {
        Mail::fake();
        config(['shop.staff_alert_email' => 'team@example.com']);

        $this->postJson('/api/v1/contact', $this->contactBody(['website' => 'http://spam.example']))->assertOk();

        $this->assertSame(0, ContactMessage::count());
        Mail::assertNothingQueued();
    }

    public function test_the_contact_form_is_throttled(): void
    {
        Mail::fake();

        foreach (range(1, 5) as $i) {
            $this->postJson('/api/v1/contact', $this->contactBody())->assertOk();
        }

        $this->postJson('/api/v1/contact', $this->contactBody())->assertStatus(429); // sixth in a minute
    }

    // ---- Newsletter ----

    public function test_signing_up_saves_a_lowercase_email(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'Ada@Example.com'])->assertOk();

        $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'ada@example.com']);
    }

    public function test_signing_up_twice_keeps_one_row_and_answers_the_same(): void
    {
        $first = $this->postJson('/api/v1/newsletter', ['email' => 'ada@example.com']);
        $second = $this->postJson('/api/v1/newsletter', ['email' => 'ADA@example.com']);

        $second->assertOk();
        $this->assertSame($first->json('message'), $second->json('message')); // nothing reveals who is already on the list
        $this->assertSame(1, NewsletterSubscriber::count());
    }

    public function test_an_invalid_newsletter_email_is_rejected(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'nope'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_a_filled_newsletter_honeypot_saves_nothing(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'bot@example.com', 'website' => 'x'])->assertOk();

        $this->assertSame(0, NewsletterSubscriber::count());
    }

    public function test_someone_who_unsubscribed_can_sign_up_again(): void
    {
        NewsletterSubscriber::create(['email' => 'ada@example.com', 'unsubscribed_at' => now()]);

        $this->postJson('/api/v1/newsletter', ['email' => 'ada@example.com'])->assertOk();

        $this->assertNull(NewsletterSubscriber::first()->unsubscribed_at);
    }
}