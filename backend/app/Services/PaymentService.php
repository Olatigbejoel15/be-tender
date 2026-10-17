<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Events\OrderPaid;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private PaymentGatewayInterface $gateway,  // Paystack (bound in the provider)
        private OrderRepositoryInterface $orders,
    ) {}

    // Start paying for one of my pending orders; returns the Paystack page URL
    public function start(User $user, string $reference): string
    {
        $order = $this->orders->findForUser($user, $reference) ?? throw new ModelNotFoundException(); // 404 if not mine

        if ($order->status !== OrderStatus::Pending) {
            throw ValidationException::withMessages(['order' => ['This order is not awaiting payment.']]);
        }

        $paymentReference = $order->reference . '-' . strtoupper(Str::random(4)); // New id per attempt (Paystack rejects repeats)

        $url = $this->gateway->initialize(
            $paymentReference,
            $order->total * 100,                                       // Naira to kobo
            $user->email,
            config('shop.frontend_url') . "/order/{$order->reference}", // Customer returns here
            ['order_reference' => $order->reference],
        );

        $this->orders->attachPaymentReference($order, $paymentReference); // Remember which attempt is live

        return $url;
    }

    // Customer came back: check with Paystack and update the order if paid
    public function confirm(User $user, string $reference): Order
    {
        $order = $this->orders->findForUser($user, $reference) ?? throw new ModelNotFoundException();

        if ($order->status === OrderStatus::Pending && $order->payment_reference) {
            $this->settle($order, $order->payment_reference);
        }

        return $this->orders->findForUser($user, $reference); // Reload with the new status
    }

    // Paystack called us: verify the signature, then settle the order
    public function handleWebhook(string $payload, ?string $signature): void
    {
        $secret = (string) config('services.paystack.secret_key');

        if ($secret === '') {
            abort(500, 'Payments are not configured.'); // Never accept webhooks with no key
        }

        $expected = hash_hmac('sha512', $payload, $secret); // What a genuine signature looks like

        if (! $signature || ! hash_equals($expected, $signature)) {
            abort(401, 'Invalid signature.'); // Not from Paystack
        }

        $event = json_decode($payload, true);

        if (($event['event'] ?? null) !== 'charge.success') {
            return; // We only care about successful charges
        }

        $paymentReference = $event['data']['reference'] ?? null;
        $orderReference   = $event['data']['metadata']['order_reference'] ?? null;
        $order = $orderReference ? $this->orders->findByReference($orderReference) : null;

        if ($order && $paymentReference && $order->status === OrderStatus::Pending) {
            $this->settle($order, $paymentReference); // Re-verify; never trust the payload alone
        }
    }

    // Ask Paystack, check the amount, then mark the order paid
    private function settle(Order $order, string $paymentReference): void
    {
        $result = $this->gateway->verify($paymentReference);

        if (! $result->paid) {
            return; // Not paid (yet)
        }

        if ($result->amount !== $order->total * 100 || $result->currency !== 'NGN') {
            Log::warning('Payment amount mismatch', ['order' => $order->reference]); // Suspicious: do not mark paid
            return;
        }
        // inside settle(), where markPaid reports that THIS call made the order paid:
        OrderPaid::dispatch($order);
        $this->orders->markPaid($order, $paymentReference); // Safe to call twice
    }
}
