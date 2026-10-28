<?php

namespace Tests\Feature\Payments;

use App\Enums\OrderStatus;
use App\Mail\OrderUpdateMail;
use App\Models\Order;
use App\Models\ProductStock;
use App\Models\OrderStatusHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\ActsAsStaff;
use Tests\Concerns\PlacesOrders;
use Tests\TestCase;

class LatePaymentTest extends TestCase
{
    use RefreshDatabase, PlacesOrders, ActsAsStaff;

    private const SECRET = 'test_secret';

    protected function setUp(): void
    {
        parent::setUp();
        $this->preparePayments();
        config(['shop.staff_alert_email' => 'team@example.com']); // This time we want the staff alert
    }

    // A signed charge.success webhook for this order
    private function webhookFor(Order $order)
    {
        $body = json_encode([
            'event' => 'charge.success',
            'data'  => ['reference' => $order->reference . '-LATE', 'metadata' => ['order_reference' => $order->reference]],
        ]);

        return $this->call('POST', '/api/v1/webhooks/paystack', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_PAYSTACK_SIGNATURE' => hash_hmac('sha512', $body, self::SECRET),
        ], $body);
    }

    // An order that was cancelled before the customer paid
    private function cancelledOrder(): Order
    {
        $order = $this->placeGuestOrder();
        $this->actingAsAdmin();
        $this->patchJson("/api/v1/admin/orders/{$order->reference}/status", ['status' => 'cancelled'])->assertOk();
        Mail::fake(); // Forget the cancellation email; only count what happens next

        return $order->fresh();
    }

    public function test_a_payment_for_a_cancelled_order_is_flagged_for_a_refund(): void
    {
        $order = $this->cancelledOrder();
        $this->gateway->willPay($order->total);

        $this->webhookFor($order)->assertOk();

        $order->refresh();
        $this->assertSame(OrderStatus::Cancelled, $order->status);   // Never silently re-opened
        $this->assertNotNull($order->refund_needed_at);
        $this->assertSame($order->reference . '-LATE', $order->payment_reference);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'user_id' => null]);
        // $this->assertStringContainsString('Refund needed', $order->statusHistories()->latest('id')->first()->note);
        $latest = OrderStatusHistory::where('order_id', $order->id)->latest('id')->first(); // Newest entry, no built-in ordering
        $this->assertStringContainsString('Refund needed', $latest->note);
    }

    public function test_the_customer_and_the_team_are_both_told(): void
    {
        $order = $this->cancelledOrder();
        $this->gateway->willPay($order->total);

        $this->webhookFor($order)->assertOk();

        Mail::assertQueuedCount(2);
        Mail::assertQueued(OrderUpdateMail::class, fn ($m) => $m->hasTo('guest@example.com'));
        Mail::assertQueued(OrderUpdateMail::class, fn ($m) => $m->hasTo('team@example.com') && $m->mailSubject === "REFUND NEEDED: {$order->reference}");
    }

    public function test_the_stock_is_not_taken_again(): void
    {
        $order = $this->cancelledOrder();
        $item = $order->items()->firstOrFail();
        $this->gateway->willPay($order->total);

        $this->webhookFor($order)->assertOk();

        $left = ProductStock::where(['product_id' => $item->product_id, 'color' => $item->color, 'size' => $item->size])->value('quantity');
        $this->assertSame(10, (int) $left); // Still on the shelf for other customers
    }

    public function test_paystack_retrying_the_webhook_does_not_flag_or_email_twice(): void
    {
        $order = $this->cancelledOrder();
        $this->gateway->willPay($order->total);

        $this->webhookFor($order)->assertOk();
        $this->webhookFor($order)->assertOk();

        Mail::assertQueuedCount(2); // One to the customer, one to the team: not four
        $this->assertSame(1, $order->statusHistories()->where('note', 'like', '%Refund needed%')->count());
        $this->assertCount(1, $this->gateway->verifyCalls); // The retry skipped Paystack altogether
    }

    public function test_an_unpaid_attempt_on_a_cancelled_order_is_ignored(): void
    {
        $order = $this->cancelledOrder(); // Fake says "not paid"

        $this->webhookFor($order)->assertOk();

        $this->assertNull($order->fresh()->refund_needed_at);
        Mail::assertNothingQueued();
    }

    public function test_the_customer_returning_to_a_cancelled_paid_order_triggers_the_same_flag(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);                                   // A live attempt exists
        $order->update(['status' => OrderStatus::Cancelled]);          // ...then the order is cancelled
        $this->gateway->willPay($order->total);

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])
            ->assertOk()->assertJsonPath('data.status', 'cancelled');

        $this->assertNotNull($order->fresh()->refund_needed_at);
    }

    public function test_confirming_a_cancelled_order_with_no_payment_attempt_does_nothing(): void
    {
        $order = $this->placeGuestOrder();                             // Never started a payment
        $order->update(['status' => OrderStatus::Cancelled]);

        $this->postJson("/api/v1/orders/{$order->reference}/confirm", ['email' => 'guest@example.com'])->assertOk();

        $this->assertCount(0, $this->gateway->verifyCalls);
        $this->assertNull($order->fresh()->refund_needed_at);
    }

    public function test_an_expired_order_that_is_paid_later_is_flagged(): void
    {
        $order = $this->placeGuestOrder();
        $this->travel(config('shop.pending_order_minutes') + 1)->minutes();
        $this->artisan('orders:expire')->assertSuccessful();           // The real expiry job cancels it
        $this->gateway->willPay($order->total);

        $this->webhookFor($order)->assertOk();

        $this->assertSame(OrderStatus::Cancelled, $order->fresh()->status);
        $this->assertNotNull($order->fresh()->refund_needed_at);
    }

    public function test_staff_can_see_which_orders_need_a_refund(): void
    {
        $flagged = $this->cancelledOrder();
        $this->gateway->willPay($flagged->total);
        $this->webhookFor($flagged)->assertOk();
        $normal = $this->placeGuestOrder('other@example.com');
        $this->actingAsAdmin();

        $this->getJson("/api/v1/admin/orders/{$flagged->reference}")->assertOk()->assertJsonPath('data.needsRefund', true);
        $this->getJson("/api/v1/admin/orders/{$normal->reference}")->assertOk()->assertJsonPath('data.needsRefund', false);
    }
}