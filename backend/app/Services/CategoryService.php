<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function __construct(private CatalogueCache $cache) {}

    // All categories, each with a products_count
    public function all(): Collection
    {
        return $this->cache->remember('categories', fn () => Category::withCount([
            'products' => fn ($q) => $q->where('is_published', true), // Drafts must not inflate the count
        ])->orderBy('id')->get());
    }
}
