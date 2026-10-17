<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Database\Eloquent\Collection;

interface StockRepositoryInterface
{
    // Fetch AND lock the rows for these options; keyed by ProductStock::key(). Use inside a transaction.
    public function lockVariants(array $variants): Collection;

    public function lockForProduct(Product $product): Collection;   // Lock every row of one product

    public function create(int $productId, string $color, string $size, int $quantity): ProductStock;

    public function setQuantity(ProductStock $row, int $quantity): void; // Absolute value

    public function change(ProductStock $row, int $delta): void;         // Relative: +5 or -2

    public function lowStock(int $threshold): Collection;                // Published options at or below the threshold
}
