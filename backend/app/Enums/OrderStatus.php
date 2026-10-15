<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending    = 'pending';    // Placed, waiting for payment
    case Paid       = 'paid';       // Payment confirmed
    case Processing = 'processing'; // Being packed
    case Shipped    = 'shipped';    // On its way
    case Delivered  = 'delivered';  // Arrived
    case Cancelled  = 'cancelled';  // Stopped before delivery

    // Friendly text for the website
    public function label(): string
    {
        return match ($this) {
            self::Pending    => 'Awaiting payment',
            self::Paid       => 'Paid',
            self::Processing => 'Processing',
            self::Shipped    => 'Shipped',
            self::Delivered  => 'Delivered',
            self::Cancelled  => 'Cancelled',
        };
    }

        // Where an order may go next (an admin cannot set "paid": only a confirmed payment does)
    public function allowedNext(): array
    {
        return match ($this) {
            self::Pending    => [self::Cancelled],
            self::Paid       => [self::Processing, self::Cancelled],
            self::Processing => [self::Shipped, self::Cancelled],
            self::Shipped    => [self::Delivered],
            self::Delivered, self::Cancelled => [], // Final states
        };
    }

    public function canMoveTo(self $next): bool
    {
        return in_array($next, $this->allowedNext(), true);
    }
}
