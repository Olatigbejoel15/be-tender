<?php

namespace Tests\Feature\Orders;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase, CreatesShopData; // Fresh database per test

    private const URL = '/api/v1/orders';

    // ---------- Happy path ----------

    public function test_a_guest_can_place_an_order(): void
    {
        $product = $this->makeProduct(['price' => 10000]);

        $this->postJson(self::URL, $this->checkoutPayload($product, ['email' => 'Guest@Example.com']))
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.email', 'guest@example.com') // Lowercased
            ->assertJsonPath('data.subtotal', 10000)
            ->assertJsonPath('data.items.0.unitPrice', 10000);

        $this->assertDatabaseHas('orders', ['email' => 'guest@example.com', 'user_id' => null, 'status' => 'pending']);
        $this->assertSame(9, $this->stockOf($product)); // 10 - 1
    }

    public function test_a_signed_in_customer_always_uses_their_account_email(): void
    {
        $user = User::factory()->create(['email' => 'ada@example.com']);
        $product = $this->makeProduct();
        Sanctum::actingAs($user); // Sends a valid token

        $this->postJson(self::URL, $this->checkoutPayload($product, ['email' => 'someone-else@example.com']))
            ->assertCreated()
            ->assertJsonPath('data.email', 'ada@example.com'); // Forced

        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    }

    // ---------- Pricing: the server decides ----------

    public function test_prices_come_from_the_database_not_the_request(): void
    {
        $product = $this->makeProduct(['price' => 10000]);
        $payload = $this->checkoutPayload($product, ['price' => 1, 'total' => 1, 'subtotal' => 1]);
        $payload['items'][0]['unit_price'] = 1; // A cheating client

        $this->postJson(self::URL, $payload)
            ->assertCreated()
            ->assertJsonPath('data.subtotal', 10000)
            ->assertJsonPath('data.items.0.unitPrice', 10000);
    }

    public function test_the_total_multiplies_price_by_quantity(): void
    {
        $product = $this->makeProduct(['price' => 10000]);
        $payload = $this->checkoutPayload($product);
        $payload['items'][0]['quantity'] = 3;

        $this->postJson(self::URL, $payload)
            ->assertCreated()
            ->assertJsonPath('data.subtotal', 30000);

        $this->assertSame(7, $this->stockOf($product)); // 10 - 3
    }

    public function test_lagos_pays_the_lagos_delivery_fee_whatever_the_capitalisation(): void
    {
        $product = $this->makeProduct(['price' => 10000]);
        $fee = config('shop.delivery_fee_lagos');

        $this->postJson(self::URL, $this->checkoutPayload($product, ['state' => ' lagos ']))
            ->assertCreated()
            ->assertJsonPath('data.deliveryFee', $fee)
            ->assertJsonPath('data.total', 10000 + $fee);
    }

    public function test_other_states_pay_the_other_delivery_fee(): void
    {
        $product = $this->makeProduct(['price' => 10000]);
        $fee = config('shop.delivery_fee_other');

        $this->postJson(self::URL, $this->checkoutPayload($product, ['state' => 'Kano']))
            ->assertCreated()
            ->assertJsonPath('data.deliveryFee', $fee)
            ->assertJsonPath('data.total', 10000 + $fee);
    }

    public function test_delivery_is_free_at_the_threshold(): void
    {
        $product = $this->makeProduct(['price' => config('shop.free_delivery_over')]); // Exactly on the line

        $this->postJson(self::URL, $this->checkoutPayload($product, ['state' => 'Kano']))
            ->assertCreated()
            ->assertJsonPath('data.deliveryFee', 0);
    }

    // ---------- Validation ----------

    public function test_required_fields_are_enforced(): void
    {
        $this->postJson(self::URL, [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'recipient_name', 'phone', 'address', 'city', 'state', 'items']);
    }

    public function test_an_empty_cart_is_rejected(): void
    {
        $product = $this->makeProduct();

        $this->postJson(self::URL, $this->checkoutPayload($product, ['items' => []]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items']);
    }

    public function test_quantity_above_the_limit_is_rejected(): void
    {
        $product = $this->makeProduct();
        $payload = $this->checkoutPayload($product);
        $payload['items'][0]['quantity'] = config('shop.max_qty') + 1;

        $this->postJson(self::URL, $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_an_unknown_product_is_rejected(): void
    {
        $product = $this->makeProduct();
        $payload = $this->checkoutPayload($product);
        $payload['items'][0]['product_id'] = 999999;

        $this->postJson(self::URL, $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.product_id']);
    }

    // ---------- Options that cannot be bought ----------

    public function test_a_colour_the_product_does_not_have_is_rejected(): void
    {
        $product = $this->makeProduct();
        $payload = $this->checkoutPayload($product);
        $payload['items'][0]['color'] = 'Pink';

        $this->postJson(self::URL, $payload)->assertUnprocessable()->assertJsonValidationErrors(['items.0']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_size_the_product_does_not_have_is_rejected(): void
    {
        $product = $this->makeProduct();
        $payload = $this->checkoutPayload($product);
        $payload['items'][0]['size'] = 'XXL';

        $this->postJson(self::URL, $payload)->assertUnprocessable()->assertJsonValidationErrors(['items.0']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_draft_product_cannot_be_bought(): void
    {
        $product = $this->makeProduct(['is_published' => false]);

        $this->postJson(self::URL, $this->checkoutPayload($product))
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_sold_out_product_cannot_be_bought(): void
    {
        $product = $this->makeProduct(['is_sold_out' => true]);

        $this->postJson(self::URL, $this->checkoutPayload($product))
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_size_switched_off_by_hand_cannot_be_bought(): void
    {
        $product = $this->makeProduct(['sold_out_sizes' => ['M']]);

        $this->postJson(self::URL, $this->checkoutPayload($product)) // The payload asks for size M
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0']);
        $this->assertDatabaseCount('orders', 0);
    }

    // ---------- Stock ----------

    public function test_asking_for_more_than_is_in_stock_is_refused_and_changes_nothing(): void
    {
        $product = $this->makeProduct(stock: 1);
        $payload = $this->checkoutPayload($product);
        $payload['items'][0]['quantity'] = 2;

        $response = $this->postJson(self::URL, $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0']);

        $this->assertStringContainsString('Only 1 left', $response->json('errors')['items.0'][0]);
        $this->assertDatabaseCount('orders', 0);   // No order saved
        $this->assertSame(1, $this->stockOf($product)); // Stock untouched
    }

    public function test_the_same_option_on_two_lines_is_counted_together(): void
    {
        $product = $this->makeProduct(stock: 3);
        $line = ['product_id' => $product->id, 'color' => 'Black', 'size' => 'M', 'quantity' => 2];

        $this->postJson(self::URL, $this->checkoutPayload($product, ['items' => [$line, $line]])) // 2 + 2 = 4 > 3
            ->assertUnprocessable();

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(3, $this->stockOf($product));
    }

    public function test_buying_the_last_unit_leaves_zero(): void
    {
        $product = $this->makeProduct(stock: 1);

        $this->postJson(self::URL, $this->checkoutPayload($product))->assertCreated();
        $this->assertSame(0, $this->stockOf($product));

        $this->postJson(self::URL, $this->checkoutPayload($product, ['email' => 'late@example.com'])) // The next buyer
            ->assertUnprocessable();
    }

    // ---------- Repeats and limits ----------

    public function test_the_same_idempotency_key_returns_the_same_order(): void
    {
        $product = $this->makeProduct();
        $headers = ['Idempotency-Key' => 'attempt-12345678'];

        $first = $this->postJson(self::URL, $this->checkoutPayload($product), $headers)->assertCreated();
        $second = $this->postJson(self::URL, $this->checkoutPayload($product), $headers)->assertOk(); // 200, not 201

        $this->assertSame($first->json('data.reference'), $second->json('data.reference'));
        $this->assertSame(1, Order::count());
        $this->assertSame(9, $this->stockOf($product)); // Taken once, not twice
    }

    public function test_one_email_cannot_hold_more_unpaid_orders_than_the_cap(): void
    {
        $product = $this->makeProduct();
        $cap = config('shop.max_pending_per_email');

        for ($i = 0; $i < $cap; $i++) {
            $this->postJson(self::URL, $this->checkoutPayload($product))->assertCreated();
        }

        $this->postJson(self::URL, $this->checkoutPayload($product))->assertStatus(429); // One too many
        $this->assertSame(10 - $cap, $this->stockOf($product)); // The refused one took nothing
    }

    public function test_the_cap_is_per_email(): void
    {
        $product = $this->makeProduct();

        for ($i = 0; $i < config('shop.max_pending_per_email'); $i++) {
            $this->postJson(self::URL, $this->checkoutPayload($product))->assertCreated();
        }

        $this->postJson(self::URL, $this->checkoutPayload($product, ['email' => 'other@example.com']))
            ->assertCreated(); // A different buyer is unaffected
    }
}