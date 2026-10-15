<?php

namespace App\DTOs;

use App\Enums\OrderStatus;

final readonly class OrderFilterData
{
    public function __construct(
        public ?OrderStatus $status, // Only this stage, or null for all
        public ?string $search,      // Reference, name, phone or email
        public ?string $from,        // Placed on/after (Y-m-d)
        public ?string $to,          // Placed on/before (Y-m-d)
        public int $perPage,         // Rows per page
    ) {}
}
