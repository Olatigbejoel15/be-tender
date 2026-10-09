<?php

namespace App\Enums;

enum ProductSort: string
{
    case PriceAsc = 'price_asc';        // cheapest first
    case PriceDesc = 'price_desc';      // most expensive first
}
