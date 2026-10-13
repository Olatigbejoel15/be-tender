<?php

namespace App\Repositories\Contracts;

use App\DTOs\ProductFilterData;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    public function getFiltered(ProductFilterData $filters): Collection;   // filtered, sorted list
    // Several products at once, keyed by id, with photos loaded
    public function findManyByIds(array $ids): \Illuminate\Support\Collection;
    public function findBySlug(string $slug): ?Product;                    // one product or null
}
