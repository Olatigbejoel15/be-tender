<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function allWithProductCount(): Collection
    {
        return Category::withCount('products')->orderBy('id')->get();   // adds products_count
    }
}
