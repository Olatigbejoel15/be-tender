<?php

namespace Tests\Feature\Payments;

use App\Enums\OrderStatus;
use App\Mail\OrderUpdateMail;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\PlacesOrders;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase, PlacesOrders;

    protected function setUp(): void
    {
        parent::setUp();
        $this->preparePayments();
    }

    // ---------- Starting a payment ----------

    public function test_a_guest_can_start_payment_with_the_right_email(): void
    {
        $order = $this->placeGuestOrder();

        $url = $this->postJson("/api/v1/orders/{$order->reference}/pay", ['email' => 'guest@example.com'])
            ->assertOk()
            ->json('authorizationUrl');

        $this->assertStringStartsWith('https://paystack.test/', $url);

        $sent = $this->gateway->initialized[0];                         // What we asked Paystack for
        $this->assertSame($order->total * 100, $sent['amountKobo']);    // Naira to kobo
        $this->assertSame('guest@example.com', $sent['email']);
        $this->assertSame(config('shop.frontend_url') . "/order/{$order->reference}", $sent['callbackUrl']);
        $this->assertSame($order->reference, $sent['metadata']['order_reference']); // Lets the webhook find the order
    }

    public function test_starting_payment_saves_the_attempt_reference(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);

        $this->assertStringStartsWith($order->reference . '-', $order->fresh()->payment_reference);
    }

    public function test_a_wrong_email_cannot_start_payment(): void
    {
        $order = $this->placeGuestOrder();

        $this->postJson("/api/v1/orders/{$order->reference}/pay", ['email' => 'thief@example.com'])->assertNotFound();
        $this->assertCount(0, $this->gateway->initialized); // Paystack was never contacted
    }

    public function test_a_guest_must_send_an_email(): void
    {
        $order = $this->placeGuestOrder();

        $this->postJson("/api/v1/orders/{$order->reference}/pay")
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_an_account_owner_can_pay_without_an_email(): void
    {
        $user = User::factory()->create();
        $product = $this->makeProduct();
        Sanctum::actingAs($user);

        $reference = $this->postJson('/api/v1/orders', $this->checkoutPayload($product))->assertCreated()->json('data.reference');

        $this->postJson("/api/v1/orders/{$reference}/pay")->assertOk();
    }

    public function test_another_customer_cannot_pay_someone_elses_order(): void
    {
        $owner = User::factory()->create();
        $product = $this->makeProduct();
        Sanctum::actingAs($owner);
        $reference = $this->postJson('/api/v1/orders', $this->checkoutPayload($product))->assertCreated()->json('data.reference');

        Sanctum::actingAs(User::factory()->create()); // Someone else signs in

        $this->postJson("/api/v1/orders/{$reference}/pay")->assertNotFound();
    }

    public function test_an_order_that_is_not_pending_cannot_be_paid_again(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Paid]);

        $this->postJson("/api/v1/orders/{$order->reference}/pay", ['email' => 'guest@example.com'])
            ->assertUnprocessable();
        $this->assertCount(0, $this->gateway->initialized);
    }

    // ---------- Confirming a payment ----------

    public function test_confirm_marks_the_order_paid_when_paystack_says_so(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);
        $this->gateway->willPay($order->total);

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        $this->assertNotNull($order->fresh()->paid_at);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'to_status' => 'paid']);
    }

    public function test_confirm_sends_the_customer_exactly_one_receipt(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);
        $this->gateway->willPay($order->total);

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])->assertOk();

        Mail::assertQueuedCount(1);
        Mail::assertQueued(OrderUpdateMail::class, fn ($mail) => $mail->hasTo('guest@example.com'));
    }

    public function test_confirming_twice_verifies_and_emails_only_once(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);
        $this->gateway->willPay($order->total);

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])->assertOk();
        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()->assertJsonPath('data.status', 'paid'); // Still fine, nothing repeated

        $this->assertCount(1, $this->gateway->verifyCalls);
        Mail::assertQueuedCount(1);
    }

    public function test_confirm_leaves_the_order_pending_when_not_paid(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order); // Fake defaults to "not paid"

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()->assertJsonPath('data.status', 'pending');

        $this->assertNull($order->fresh()->paid_at);
        Mail::assertNothingQueued();
    }

    public function test_a_payment_of_the_wrong_amount_is_not_accepted(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);
        $this->gateway->willPay($order->total - 1); // One naira short

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()->assertJsonPath('data.status', 'pending');

        Mail::assertNothingQueued();
    }

    public function test_a_payment_in_the_wrong_currency_is_not_accepted(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);
        $this->gateway->willPay($order->total, 'USD'); // Right number, wrong money

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()->assertJsonPath('data.status', 'pending');
    }

    public function test_confirm_does_nothing_before_a_payment_was_started(): void
    {
        $order = $this->placeGuestOrder(); // No /pay call, so no payment reference

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()->assertJsonPath('data.status', 'pending');

        $this->assertCount(0, $this->gateway->verifyCalls); // Nothing to ask Paystack about
    }

    public function test_a_wrong_email_cannot_confirm(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'thief@example.com'])->assertNotFound();
    }

    // ---------- The exactly-once guarantee ----------

    public function test_mark_paid_only_succeeds_once(): void
    {
        $order = $this->placeGuestOrder();
        $orders = app(OrderRepositoryInterface::class);

        $this->assertTrue($orders->markPaid($order, 'PAY-1'));   // First caller flips it
        $this->assertFalse($orders->markPaid($order, 'PAY-1'));  // Second caller (a racing webhook) does not
        $this->assertDatabaseCount('order_status_histories', 2); // Placed + paid, never paid twice
    }
}