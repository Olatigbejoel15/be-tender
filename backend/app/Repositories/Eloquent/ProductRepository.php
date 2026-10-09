<?php

namespace App\Repositories\Eloquent;

use App\DTOs\ProductFilterData;
use App\Enums\ProductSort;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    public function getFiltered(ProductFilterData $filters): Collection
    {
        return Product::query()
            ->with('category')                                              // load categories in one query
            ->when($filters->category, fn ($q, $slug) =>                    // runs only if a category was given
                $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->when($filters->featured, fn ($q) =>                           // featured only
                $q->where('is_featured', true))
            ->when($filters->search, fn ($q, $term) =>                      // name or description match
                $q->where(fn ($w) => $w
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")))
            ->when($filters->sort === ProductSort::PriceAsc, fn ($q) => $q->orderBy('price'))
            ->when($filters->sort === ProductSort::PriceDesc, fn ($q) => $q->orderByDesc('price'))
            ->orderBy('id')                                                 // default order / tie-breaker
            ->get();
    }

    public function findBySlug(string $slug): ?Product
    {
        return Product::with('category')->where('slug', $slug)->first();    // null if not found
    }
}
