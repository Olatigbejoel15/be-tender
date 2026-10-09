<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    public function allWithProductCount(): Collection;   // every category + products_count
}
