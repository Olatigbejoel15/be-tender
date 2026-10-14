<?php

namespace App\Services\Contracts;

use App\DTOs\PaymentVerification;

interface PaymentGatewayInterface
{
    // Start a payment and return the page URL the customer pays on
    public function initialize(string $reference, int $amountKobo, string $email, string $callbackUrl, array $metadata = []): string;

    // Ask the provider what really happened to a payment
    public function verify(string $reference): PaymentVerification;
}
