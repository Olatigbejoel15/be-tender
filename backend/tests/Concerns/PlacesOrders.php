<?php

namespace Tests\Concerns;

use App\Models\Order;
use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Mail;
use Tests\Support\FakePaymentGateway;

trait PlacesOrders
{
    use CreatesShopData; // Product and payload helpers

    protected FakePaymentGateway $gateway;

    // Call from setUp(): swap in the fake gateway, fix config, capture mail
    protected function preparePayments(): void
    {
        $this->gateway = new FakePaymentGateway();
        $this->app->instance(PaymentGatewayInterface::class, $this->gateway); // Container now hands out the fake

        config([
            'services.paystack.secret_key' => 'test_secret', // Known key for webhook signatures
            'shop.staff_alert_email'       => null,          // So only the customer email is sent
        ]);

        Mail::fake(); // Record emails instead of sending
    }

    // Place a guest order through the real checkout endpoint; returns the saved order
    protected function placeGuestOrder(string $email = 'guest@example.com'): Order
    {
        $product = $this->makeProduct(['price' => 10000]);

        $reference = $this->postJson('/api/v1/orders', $this->checkoutPayload($product, ['email' => $email]))
            ->assertCreated()
            ->json('data.reference');

        return Order::where('reference', $reference)->firstOrFail();
    }

    // Start payment for a guest order (sets its payment reference)
    protected function startPayment(Order $order, string $email = 'guest@example.com'): void
    {
        $this->postJson("/api/v1/orders/{$order->reference}/pay", ['email' => $email])->assertOk();
    }
}