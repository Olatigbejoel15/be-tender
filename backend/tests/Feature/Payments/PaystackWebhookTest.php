<?php

namespace Tests\Feature\Payments;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\PlacesOrders;
use Tests\TestCase;

class PaystackWebhookTest extends TestCase
{
    use RefreshDatabase, PlacesOrders;

    private const URL = '/api/v1/webhooks/paystack';
    private const SECRET = 'test_secret'; // Same value preparePayments() puts in config

    protected function setUp(): void
    {
        parent::setUp();
        $this->preparePayments();
    }

    // Send a raw webhook. $signature: 'valid' = sign it properly, null = send none, anything else = send as is
    private function webhook(array $event, ?string $signature = 'valid')
    {
        $body = json_encode($event);                       // Signature must match these exact bytes
        $headers = ['CONTENT_TYPE' => 'application/json'];

        if ($signature === 'valid') {
            $headers['HTTP_X_PAYSTACK_SIGNATURE'] = hash_hmac('sha512', $body, self::SECRET);
        } elseif ($signature !== null) {
            $headers['HTTP_X_PAYSTACK_SIGNATURE'] = $signature;
        }

        return $this->call('POST', self::URL, [], [], [], $headers, $body);
    }

    private function chargeSuccess(Order $order): array
    {
        return [
            'event' => 'charge.success',
            'data'  => ['reference' => $order->reference . '-ABCD', 'metadata' => ['order_reference' => $order->reference]],
        ];
    }

    // ---------- Who may call it ----------

    public function test_a_wrong_signature_is_rejected(): void
    {
        $order = $this->placeGuestOrder();
        $this->gateway->willPay($order->total);

        $this->webhook($this->chargeSuccess($order), 'not-a-real-signature')->assertUnauthorized();

        $this->assertSame('pending', $order->fresh()->status->value); // Nothing changed
        $this->assertCount(0, $this->gateway->verifyCalls);
    }

    public function test_a_missing_signature_is_rejected(): void
    {
        $order = $this->placeGuestOrder();

        $this->webhook($this->chargeSuccess($order), null)->assertUnauthorized();
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    public function test_webhooks_are_refused_when_no_secret_is_configured(): void
    {
        config(['services.paystack.secret_key' => '']); // A misconfigured server must never accept webhooks
        $order = $this->placeGuestOrder();

        $this->webhook($this->chargeSuccess($order))->assertStatus(500);
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    // ---------- What it does ----------

    public function test_a_signed_charge_success_marks_the_order_paid(): void
    {
        $order = $this->placeGuestOrder();
        $this->gateway->willPay($order->total);

        $this->webhook($this->chargeSuccess($order))->assertOk();

        $this->assertSame('paid', $order->fresh()->status->value);
        $this->assertNotNull($order->fresh()->paid_at);
        Mail::assertQueuedCount(1);
    }

    public function test_the_webhook_re_verifies_with_paystack_and_does_not_trust_the_payload(): void
    {
        $order = $this->placeGuestOrder(); // Fake says "not paid": the payload lies

        $this->webhook($this->chargeSuccess($order))->assertOk();

        $this->assertCount(1, $this->gateway->verifyCalls); // It asked Paystack
        $this->assertSame('pending', $order->fresh()->status->value);
        Mail::assertNothingQueued();
    }

    public function test_other_events_are_ignored(): void
    {
        $order = $this->placeGuestOrder();
        $this->gateway->willPay($order->total);

        $this->webhook(['event' => 'charge.failed', 'data' => ['reference' => 'X', 'metadata' => ['order_reference' => $order->reference]]])
            ->assertOk();

        $this->assertSame('pending', $order->fresh()->status->value);
        $this->assertCount(0, $this->gateway->verifyCalls);
    }

    public function test_an_unknown_order_is_ignored_quietly(): void
    {
        $this->webhook(['event' => 'charge.success', 'data' => ['reference' => 'X', 'metadata' => ['order_reference' => 'BT-NOSUCH00']]])
            ->assertOk(); // Paystack must get a 200 or it keeps retrying

        $this->assertCount(0, $this->gateway->verifyCalls);
    }

    // ---------- Exactly once, whichever arrives first ----------

    public function test_webhook_then_confirm_sends_one_email(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);
        $this->gateway->willPay($order->total);

        $this->webhook($this->chargeSuccess($order))->assertOk();
        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()->assertJsonPath('data.status', 'paid');

        Mail::assertQueuedCount(1);
    }

    public function test_confirm_then_webhook_sends_one_email(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);
        $this->gateway->willPay($order->total);

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])->assertOk();
        $this->webhook($this->chargeSuccess($order))->assertOk(); // Arrives late

        Mail::assertQueuedCount(1);
        $this->assertCount(1, $this->gateway->verifyCalls); // The late webhook did not even ask Paystack again
    }

    public function test_a_repeated_webhook_changes_nothing(): void
    {
        $order = $this->placeGuestOrder();
        $this->gateway->willPay($order->total);

        $this->webhook($this->chargeSuccess($order))->assertOk();
        $this->webhook($this->chargeSuccess($order))->assertOk(); // Paystack retries

        Mail::assertQueuedCount(1);
        $this->assertDatabaseCount('order_status_histories', 2); // Placed + paid
    }
}