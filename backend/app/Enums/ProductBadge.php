<?php

namespace App\Enums;

enum ProductBadge: string
{
    case New = 'New';                   // shown as a "New" label on the card
    case BestSeller = 'Best Seller';    // shown as a "Best Seller" label
}
