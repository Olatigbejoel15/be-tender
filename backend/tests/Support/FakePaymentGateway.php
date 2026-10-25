<?php

namespace Tests\Support;

use App\DTOs\PaymentVerification;
use App\Services\Contracts\PaymentGatewayInterface;

class FakePaymentGateway implements PaymentGatewayInterface
{
    public array $initialized = [];             // Every start-payment request we received
    public array $verifyCalls = [];             // Every payment reference we were asked to verify
    private ?PaymentVerification $result = null; // What verify() will answer

    public function initialize(string $reference, int $amountKobo, string $email, string $callbackUrl, array $metadata = []): string
    {
        $this->initialized[] = compact('reference', 'amountKobo', 'email', 'callbackUrl', 'metadata');

        return 'https://paystack.test/pay/' . $reference; // A fake payment page
    }

    public function verify(string $reference): PaymentVerification
    {
        $this->verifyCalls[] = $reference;

        return $this->result ?? new PaymentVerification(false, 0, 'NGN'); // Default: not paid
    }

    // Tell the fake the customer paid this many naira (in the right currency)
    public function willPay(int $naira, string $currency = 'NGN'): void
    {
        $this->result = new PaymentVerification(true, $naira * 100, $currency); // Paystack uses kobo
    }
}