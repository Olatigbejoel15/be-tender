<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function __construct(private CategoryRepositoryInterface $categories) {}

    public function all(): Collection
    {
        return $this->categories->allWithProductCount();
    }
}
