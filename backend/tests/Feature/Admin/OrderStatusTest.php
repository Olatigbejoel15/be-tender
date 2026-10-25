<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductStock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\ActsAsStaff;
use Tests\Concerns\PlacesOrders;
use Tests\TestCase;

class OrderStatusTest extends TestCase
{
    use RefreshDatabase, PlacesOrders, ActsAsStaff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->preparePayments(); // Fake mail, no staff alert address
    }

    // Move an order as the signed-in admin
    private function setStatus(Order $order, string $status, ?string $note = null)
    {
        return $this->patchJson("/api/v1/admin/orders/{$order->reference}/status", array_filter(['status' => $status, 'note' => $note]));
    }

    // Units left of the (only) item an order holds
    private function stockLeftFor(Order $order): int
    {
        $item = $order->items()->firstOrFail();

        return (int) ProductStock::where(['product_id' => $item->product_id, 'color' => $item->color, 'size' => $item->size])->value('quantity');
    }

    // ---------- The allowed path ----------

    public function test_a_paid_order_moves_through_to_delivered_with_a_full_history(): void
    {
        $order = $this->placeGuestOrder();           // Place first, while still a guest
        $order->update(['status' => OrderStatus::Paid]);
        $this->actingAsAdmin();

        $this->setStatus($order, 'processing')->assertOk()->assertJsonPath('data.status', 'processing');
        $this->setStatus($order, 'shipped')->assertOk()->assertJsonPath('data.status', 'shipped');
        $this->setStatus($order, 'delivered')->assertOk()->assertJsonPath('data.status', 'delivered');

        $this->assertDatabaseCount('order_status_histories', 4); // Placed + 3 moves
    }

    public function test_the_customer_is_emailed_on_shipped_and_delivered_but_not_on_processing(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Paid]);
        $this->actingAsAdmin();

        $this->setStatus($order, 'processing')->assertOk();
        Mail::assertNothingQueued();

        $this->setStatus($order, 'shipped')->assertOk();
        $this->setStatus($order, 'delivered')->assertOk();
        Mail::assertQueuedCount(2);
    }

    public function test_the_history_records_who_made_the_change_and_why(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Paid]);
        $admin = $this->actingAsAdmin();

        $this->setStatus($order, 'processing', 'Packing now')->assertOk();

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id, 'user_id' => $admin->id, 'to_status' => 'processing', 'note' => 'Packing now',
        ]);
    }

    // ---------- Moves that are not allowed ----------

    public function test_an_admin_cannot_mark_an_order_paid_by_hand(): void
    {
        $order = $this->placeGuestOrder();
        $this->actingAsAdmin();

        $this->setStatus($order, 'paid')->assertUnprocessable()->assertJsonValidationErrors(['status']); // Only a confirmed payment can do that
        $this->assertSame(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_an_unpaid_order_cannot_jump_to_shipped(): void
    {
        $order = $this->placeGuestOrder();
        $this->actingAsAdmin();

        $this->setStatus($order, 'shipped')->assertUnprocessable()->assertJsonValidationErrors(['status']);
    }

    public function test_a_delivered_order_cannot_change_again(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Delivered]);
        $this->actingAsAdmin();

        $this->setStatus($order, 'cancelled')->assertUnprocessable();
    }

    public function test_a_made_up_status_is_rejected(): void
    {
        $order = $this->placeGuestOrder();
        $this->actingAsAdmin();

        $this->setStatus($order, 'teleported')->assertUnprocessable()->assertJsonValidationErrors(['status']);
    }

    public function test_an_unknown_order_is_a_404(): void
    {
        $this->actingAsAdmin();

        $this->patchJson('/api/v1/admin/orders/BT-NOSUCH00/status', ['status' => 'cancelled'])->assertNotFound();
    }

    // ---------- Cancelling gives the stock back ----------

    public function test_cancelling_an_unpaid_order_returns_its_stock_and_emails_the_customer(): void
    {
        $order = $this->placeGuestOrder();                 // Takes 1 of 10
        $this->assertSame(9, $this->stockLeftFor($order));
        $this->actingAsAdmin();

        $this->setStatus($order, 'cancelled', 'Customer asked')->assertOk()->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(10, $this->stockLeftFor($order)); // Back on the shelf
        Mail::assertQueued(\App\Mail\OrderUpdateMail::class, fn ($m) => $m->hasTo('guest@example.com'));
    }

    public function test_cancelling_a_paid_order_also_returns_its_stock(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Paid]);
        $this->actingAsAdmin();

        $this->setStatus($order, 'cancelled')->assertOk();

        $this->assertSame(10, $this->stockLeftFor($order));
    }

    public function test_stock_is_never_returned_twice(): void
    {
        $order = $this->placeGuestOrder();
        $this->actingAsAdmin();

        $this->setStatus($order, 'cancelled')->assertOk();
        $this->setStatus($order, 'cancelled')->assertUnprocessable(); // Already final

        $this->assertSame(10, $this->stockLeftFor($order)); // Not 11
        $this->assertNull($order->fresh()->stock_reserved_at); // Marked as released
    }
}