<?php

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Mail\OrderUpdateMail;
use App\Models\Order;
use App\Models\ProductStock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\PlacesOrders;
use Tests\TestCase;

class OrderExpiryTest extends TestCase
{
    use RefreshDatabase, PlacesOrders;

    protected function setUp(): void
    {
        parent::setUp();
        $this->preparePayments();
    }

    private function stockLeftFor(Order $order): int
    {
        $item = $order->items()->firstOrFail();

        return (int) ProductStock::where(['product_id' => $item->product_id, 'color' => $item->color, 'size' => $item->size])->value('quantity');
    }

    // Jump the clock past the timeout
    private function waitPastTimeout(): void
    {
        $this->travel(config('shop.pending_order_minutes') + 1)->minutes();
    }

    public function test_an_old_unpaid_order_is_cancelled_and_its_stock_returned(): void
    {
        $order = $this->placeGuestOrder();
        $this->assertSame(9, $this->stockLeftFor($order));

        $this->waitPastTimeout();
        $this->artisan('orders:expire')->expectsOutputToContain('Cancelled 1 unpaid order')->assertSuccessful();

        $this->assertSame(OrderStatus::Cancelled, $order->fresh()->status);
        $this->assertSame(10, $this->stockLeftFor($order));
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'to_status' => 'cancelled', 'user_id' => null]); // null = System
        Mail::assertQueued(OrderUpdateMail::class, fn ($m) => $m->hasTo('guest@example.com'));
    }

    public function test_a_recent_unpaid_order_is_left_alone(): void
    {
        $order = $this->placeGuestOrder();

        $this->travel(config('shop.pending_order_minutes') - 10)->minutes(); // Still inside the window
        $this->artisan('orders:expire')->expectsOutputToContain('Cancelled 0')->assertSuccessful();

        $this->assertSame(OrderStatus::Pending, $order->fresh()->status);
        $this->assertSame(9, $this->stockLeftFor($order));
    }

    public function test_a_paid_order_never_expires(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Paid]);

        $this->waitPastTimeout();
        $this->artisan('orders:expire')->assertSuccessful();

        $this->assertSame(OrderStatus::Paid, $order->fresh()->status);
        $this->assertSame(9, $this->stockLeftFor($order)); // Paid customers keep their stock
    }

    public function test_the_minutes_option_overrides_the_timeout(): void
    {
        $order = $this->placeGuestOrder();

        $this->travel(10)->minutes();
        $this->artisan('orders:expire', ['--minutes' => 5])->expectsOutputToContain('Cancelled 1')->assertSuccessful();

        $this->assertSame(OrderStatus::Cancelled, $order->fresh()->status);
    }

    public function test_running_it_twice_does_not_return_stock_twice(): void
    {
        $order = $this->placeGuestOrder();

        $this->waitPastTimeout();
        $this->artisan('orders:expire')->assertSuccessful();
        $this->artisan('orders:expire')->expectsOutputToContain('Cancelled 0')->assertSuccessful();

        $this->assertSame(10, $this->stockLeftFor($order)); // Not 11
    }
}