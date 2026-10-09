<?php

namespace App\Services;

use App\DTOs\ProductFilterData;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductService
{
    public function __construct(private ProductRepositoryInterface $products) {} // interface, not the Eloquent class

    public function list(ProductFilterData $filters): Collection
    {
        return $this->products->getFiltered($filters);                // business rules (caching etc.) can go here later
    }

    public function findBySlug(string $slug): Product
    {
        return $this->products->findBySlug($slug)
            ?? throw (new ModelNotFoundException)->setModel(Product::class, [$slug]); // Laravel turns this into a 404
    }
}
