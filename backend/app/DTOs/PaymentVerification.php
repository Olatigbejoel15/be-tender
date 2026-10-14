<?php

namespace App\DTOs;

final readonly class PaymentVerification
{
    public function __construct(
        public bool $paid,       // Did the payment succeed?
        public int $amount,      // Amount charged, in kobo
        public string $currency, // Should be NGN
    ) {}
}
