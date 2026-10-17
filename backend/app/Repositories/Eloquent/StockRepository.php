<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Models\ProductStock;
use App\Repositories\Contracts\StockRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StockRepository implements StockRepositoryInterface
{
    public function lockVariants(array $variants): Collection
    {
        if ($variants === []) {
            return new Collection();
        }

        return ProductStock::query()
            ->where(function ($q) use ($variants) {
                foreach ($variants as $v) {                                  // One OR-group per option
                    $q->orWhere(fn ($w) => $w
                        ->where('product_id', $v['product_id'])
                        ->where('color', $v['color'])
                        ->where('size', $v['size']));
                }
            })
            ->orderBy('product_id')->orderBy('color')->orderBy('size')      // Same lock order everywhere = no deadlocks
            ->lockForUpdate()                                                // Others wait until we commit
            ->get()
            ->keyBy(fn ($r) => ProductStock::key($r->product_id, $r->color, $r->size));
    }

    public function lockForProduct(Product $product): Collection
    {
        return ProductStock::where('product_id', $product->id)
            ->orderBy('color')->orderBy('size')
            ->lockForUpdate()
            ->get()
            ->keyBy(fn ($r) => ProductStock::key($r->product_id, $r->color, $r->size));
    }

    public function create(int $productId, string $color, string $size, int $quantity): ProductStock
    {
        return ProductStock::create(['product_id' => $productId, 'color' => $color, 'size' => $size, 'quantity' => $quantity]);
    }

    public function setQuantity(ProductStock $row, int $quantity): void
    {
        $row->update(['quantity' => $quantity]);
    }

    public function change(ProductStock $row, int $delta): void
    {
        $row->increment('quantity', $delta); // Done in SQL (quantity = quantity + delta), also updates the model
    }

    public function lowStock(int $threshold): Collection
    {
        return ProductStock::with('product:id,name,slug')
            ->where('quantity', '<=', $threshold)
            ->whereHas('product', fn ($q) => $q->where('is_published', true)) // Skip drafts and deleted products
            ->orderBy('quantity')->orderBy('product_id')
            ->get();
    }
}
