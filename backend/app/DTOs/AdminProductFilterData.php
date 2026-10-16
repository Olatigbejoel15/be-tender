<?php

namespace App\DTOs;

final readonly class AdminProductFilterData
{
    public function __construct(
        public ?string $search,     // Name match
        public ?string $category,   // Category slug
        public ?bool $published,    // true = live, false = drafts, null = both
        public ?bool $soldOut,      // true/false/null
        public int $perPage,
    ) {}
}
