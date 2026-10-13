<?php

namespace App\DTOs;

final readonly class CartLineData
{
    public function __construct(
        public int $productId, // Which product
        public string $color,  // Colour name, e.g. "Dark Blue"
        public string $size,   // Size or option, e.g. "M"
        public int $quantity,  // How many
    ) {}
}
