<?php

namespace App\Repositories\Contracts;

use App\DTOs\ProductFilterData;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    public function getFiltered(ProductFilterData $filters): Collection;   // filtered, sorted list

    public function findBySlug(string $slug): ?Product;                    // one product or null
}
