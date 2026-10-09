<?php

namespace App\DTOs;

use App\Enums\ProductSort;

// A typed bag of filters, passed from request -> service -> repository
final readonly class ProductFilterData
{
    public function __construct(
        public ?string $category = null,    // category slug, e.g. "women"
        public bool $featured = false,      // only featured products?
        public ?string $search = null,      // text to look for
        public ?ProductSort $sort = null,   // chosen sort order
    ) {}
}
