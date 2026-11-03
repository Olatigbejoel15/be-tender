<?php

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\PlacesOrders;
use Tests\TestCase;

class OrderDeliveryUpdateTest extends TestCase
{
    use RefreshDatabase;
    use PlacesOrders; // fake gateway + order helpers

    protected function setUp(): void
    {
        parent::setUp();
        $this->preparePayments(); // fake Paystack, fixed config, captured mail
    }

    // PATCH url for an order
    private function url(Order $order): string
    {
        return "/api/v1/orders/{$order->reference}/delivery";
    }

    // A valid guest edit body; override any key
    private function body(array $over = []): array
    {
        return array_merge([
            'email' => 'guest@example.com', 'recipient_name' => 'New Name', 'phone' => '08099999999',
            'address' => '9 New Road', 'city' => 'Ikeja', 'state' => 'Lagos',
        ], $over);
    }

    // The fee of a zone as configured (so the tests survive price changes)
    private function zoneFee(string $zone): int
    {
        return collect(config('shop.delivery_zones'))->firstWhere('name', $zone)['fee'];
    }

    // An order placed by a signed-in customer (no email in the body: the account supplies it)
    private function placeAccountOrder(User $user): Order
    {
        Sanctum::actingAs($user);
        $payload = $this->checkoutPayload($this->makeProduct(['price' => 10000]));
        unset($payload['email']);

        $reference = $this->postJson('/api/v1/orders', $payload)->assertCreated()->json('data.reference');

        return Order::where('reference', $reference)->firstOrFail();
    }

    public function test_a_guest_can_change_the_state_and_the_fee_and_total_follow(): void
    {
        $order = $this->placeGuestOrder(); // Lagos, subtotal 10000
        $fee = $this->zoneFee('North');

        $this->patchJson($this->url($order), $this->body(['state' => 'Kano']))
            ->assertOk()
            ->assertJsonPath('data.state', 'Kano')
            ->assertJsonPath('data.deliveryFee', $fee)
            ->assertJsonPath('data.total', 10000 + $fee);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'state' => 'Kano', 'delivery_fee' => $fee, 'total' => 10000 + $fee]);
    }

    public function test_changing_only_the_address_keeps_the_fee(): void
    {
        $order = $this->placeGuestOrder();
        $fee = $order->delivery_fee;

        $this->patchJson($this->url($order), $this->body(['address' => '1 Better Street', 'recipient_name' => 'Ada Obi']))
            ->assertOk()
            ->assertJsonPath('data.address', '1 Better Street')
            ->assertJsonPath('data.recipientName', 'Ada Obi')
            ->assertJsonPath('data.deliveryFee', $fee);
    }

    public function test_the_change_is_recorded_in_the_order_history(): void
    {
        $order = $this->placeGuestOrder();

        $this->patchJson($this->url($order), $this->body(['state' => 'Kano']))->assertOk();

        $note = OrderStatusHistory::where('order_id', $order->id)->latest('id')->first()->note;
        $this->assertStringContainsString('Lagos', $note);
        $this->assertStringContainsString('Kano', $note);
    }

    public function test_the_total_cannot_be_set_from_the_browser(): void
    {
        $order = $this->placeGuestOrder();
        $fee = $this->zoneFee('Lagos');

        $this->patchJson($this->url($order), $this->body(['total' => 1, 'delivery_fee' => 0])) // extra keys are ignored
            ->assertOk()
            ->assertJsonPath('data.deliveryFee', $fee)
            ->assertJsonPath('data.total', 10000 + $fee);
    }

    public function test_a_wrong_email_is_a_404_and_changes_nothing(): void
    {
        $order = $this->placeGuestOrder();

        $this->patchJson($this->url($order), $this->body(['email' => 'stranger@example.com', 'state' => 'Kano']))->assertNotFound();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'state' => 'Lagos']);
    }

    public function test_a_guest_must_send_an_email(): void
    {
        $order = $this->placeGuestOrder();
        $body = $this->body();
        unset($body['email']);

        $this->patchJson($this->url($order), $body)->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_another_signed_in_customer_cannot_change_someone_elses_order(): void
    {
        $order = $this->placeGuestOrder();
        Sanctum::actingAs(User::factory()->create()); // a different person, no email proof
        $body = $this->body(['state' => 'Kano']);
        unset($body['email']);

        $this->patchJson($this->url($order), $body)->assertNotFound();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'state' => 'Lagos']);
    }

    public function test_an_account_owner_can_change_their_order_without_an_email(): void
    {
        $order = $this->placeAccountOrder(User::factory()->create());
        $body = $this->body(['state' => 'Kano']);
        unset($body['email']);

        $this->patchJson($this->url($order), $body)->assertOk()->assertJsonPath('data.state', 'Kano');
    }

    public function test_a_paid_order_cannot_be_changed(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Paid, 'paid_at' => now()]);

        $this->patchJson($this->url($order), $this->body(['state' => 'Kano']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('order');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'state' => 'Lagos']);
    }

    public function test_a_cancelled_order_cannot_be_changed(): void
    {
        $order = $this->placeGuestOrder();
        $order->update(['status' => OrderStatus::Cancelled]);

        $this->patchJson($this->url($order), $this->body())->assertStatus(422)->assertJsonValidationErrors('order');
    }

    public function test_after_payment_started_a_state_change_that_alters_the_fee_is_refused(): void
    {
        $order = $this->placeGuestOrder(); // Lagos
        $this->startPayment($order);       // a Paystack page for the old amount now exists
        $total = $order->fresh()->total;

        $this->patchJson($this->url($order), $this->body(['state' => 'Kano']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('state');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'state' => 'Lagos', 'total' => $total]); // untouched
    }

    public function test_after_payment_started_the_address_can_still_change(): void
    {
        $order = $this->placeGuestOrder();
        $this->startPayment($order);

        $this->patchJson($this->url($order), $this->body(['address' => '5 Fixed Avenue']))
            ->assertOk()
            ->assertJsonPath('data.address', '5 Fixed Avenue');
    }

    public function test_after_payment_started_a_state_in_the_same_zone_is_allowed(): void
    {
        $product = $this->makeProduct(['price' => 10000]);
        $reference = $this->postJson('/api/v1/orders', $this->checkoutPayload($product, ['state' => 'Ogun']))
            ->assertCreated()->json('data.reference');
        $order = Order::where('reference', $reference)->firstOrFail();
        $this->startPayment($order);

        $this->patchJson($this->url($order), $this->body(['state' => 'Oyo'])) // Ogun and Oyo share the Nearby fee
            ->assertOk()
            ->assertJsonPath('data.state', 'Oyo')
            ->assertJsonPath('data.deliveryFee', $this->zoneFee('Nearby'));
    }

    public function test_a_free_delivery_order_stays_free_in_any_state(): void
    {
        config(['shop.free_delivery_over' => 100000]);
        $product = $this->makeProduct(['price' => 150000]);
        $reference = $this->postJson('/api/v1/orders', $this->checkoutPayload($product))->assertCreated()->json('data.reference');
        $order = Order::where('reference', $reference)->firstOrFail();

        $this->patchJson($this->url($order), $this->body(['state' => 'Kano']))
            ->assertOk()
            ->assertJsonPath('data.deliveryFee', 0)
            ->assertJsonPath('data.total', 150000);
    }

    public function test_an_unknown_state_is_rejected(): void
    {
        $order = $this->placeGuestOrder();

        $this->patchJson($this->url($order), $this->body(['state' => 'Atlantis']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('state');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'state' => 'Lagos']);
    }

    public function test_the_delivery_fields_are_required(): void
    {
        $order = $this->placeGuestOrder();

        $this->patchJson($this->url($order), ['email' => 'guest@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['recipient_name', 'phone', 'address', 'city', 'state']);
    }
}