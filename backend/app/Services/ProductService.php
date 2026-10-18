<?php

namespace App\Services;

use App\DTOs\ProductFilterData;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductService
{
    public function __construct(
        private ProductRepositoryInterface $products, // interface, not the Eloquent class
        private CatalogueCache $cache,                // our versioned cache
    ) {}

    // Returns the finished JSON-ready list (small to cache), not Eloquent models (huge to cache)
    public function list(ProductFilterData $filters): array
    {
        $build = fn () => ProductResource::collection($this->products->getFiltered($filters))->resolve();

        if ($filters->search !== null) {
            return $build(); // Never cache free-text searches (cache flooding)
        }

        $key = 'products:v2:' . md5(json_encode([$filters->category, $filters->featured, $filters->sort?->value]));

        return $this->cache->remember($key, $build);
    }

    // One product as JSON-ready data
    public function findBySlug(string $slug): array
    {
        return $this->cache->remember("product:v2:{$slug}", function () use ($slug) {
            $product = $this->products->findBySlug($slug)
                ?? throw (new ModelNotFoundException)->setModel(Product::class, [$slug]); // A 404 is never cached

            return (new ProductResource($product))->resolve();
        });
    }
}
