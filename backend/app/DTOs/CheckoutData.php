<?php

namespace App\DTOs;

final readonly class CheckoutData
{
    /** @param CartLineData[] $lines */
    public function __construct(
        public string $recipientName, // Who receives the parcel
        public string $phone,         // Delivery contact
        public string $address,       // Street address
        public string $city,
        public string $state,         // Decides the delivery fee
        public array $lines,          // The cart lines
    ) {}
}
