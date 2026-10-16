<?php

namespace App\Services;

use App\DTOs\ProductFilterData;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductService
{
    public function __construct(
        private ProductRepositoryInterface $products, // interface, not the Eloquent class
        private CatalogueCache $cache,                // our versioned cache
    ) {}

    public function list(ProductFilterData $filters): Collection
    {
        if ($filters->search !== null) {
            return $this->products->getFiltered($filters); // Never cache free-text searches (cache flooding)
        }

        $key = 'products:' . md5(json_encode([$filters->category, $filters->featured, $filters->sort?->value]));

        return $this->cache->remember($key, fn () => $this->products->getFiltered($filters));
    }

    public function findBySlug(string $slug): Product
    {
        return $this->cache->remember("product:{$slug}", fn () => $this->products->findBySlug($slug)
            ?? throw (new ModelNotFoundException)->setModel(Product::class, [$slug])); // A 404 is never cached
    }
}
