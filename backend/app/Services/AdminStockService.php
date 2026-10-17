<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\User;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\StockRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminStockService
{
    public function __construct(
        private ProductRepositoryInterface $products,
        private StockRepositoryInterface $stock,
        private AuditLogger $audit,
        private CatalogueCache $cache,
    ) {}

    public function show(int $productId): Product
    {
        return $this->products->findForAdmin($productId) ?? throw (new ModelNotFoundException)->setModel(Product::class, [$productId]);
    }

    public function lowStock(): Collection
    {
        return $this->stock->lowStock((int) config('shop.low_stock_threshold'));
    }

    // $entries: [['color' => 'Black', 'size' => 'M', 'set' => 10] or ['color' => ..., 'size' => ..., 'add' => 5], ...]
    public function adjust(User $actor, int $productId, array $entries): Product
    {
        $product = $this->show($productId);
        $lines = [];

        foreach ($entries as $i => $entry) {                       // Match every entry to a real option (canonical spelling)
            $color = collect($product->colors)->first(fn ($c) => strcasecmp($c['name'], $entry['color']) === 0)['name'] ?? null;
            $size  = collect($product->sizes)->first(fn ($s) => strcasecmp($s, $entry['size']) === 0);

            if ($color === null || $size === null) {
                throw ValidationException::withMessages(["stock.{$i}" => ["{$product->name} has no option {$entry['color']} / {$entry['size']}."]]);
            }

            $lines[] = ['color' => $color, 'size' => $size, 'set' => $entry['set'] ?? null, 'add' => $entry['add'] ?? null];
        }

        DB::transaction(function () use ($actor, $product, $lines) {
            $rows = $this->stock->lockForProduct($product);        // Lock all of this product's rows
            $changes = [];

            foreach ($lines as $i => $line) {
                $key    = ProductStock::key($product->id, $line['color'], $line['size']);
                $row    = $rows->get($key);
                $before = $row?->quantity ?? 0;
                $after  = $line['set'] !== null ? (int) $line['set'] : $before + (int) $line['add']; // Absolute or relative

                if ($after < 0) {
                    throw ValidationException::withMessages(["stock.{$i}" => ["Stock cannot go below 0 ({$line['color']} / {$line['size']} has {$before})."]]);
                }

                if ($row) {
                    $this->stock->setQuantity($row, $after);
                } else {
                    $rows->put($key, $this->stock->create($product->id, $line['color'], $line['size'], $after));
                }

                if ($before !== $after) {
                    $changes["{$line['color']} / {$line['size']}"] = ['from' => $before, 'to' => $after];
                }
            }

            if ($changes !== []) {
                $this->audit->record($actor, 'stock.updated', 'product', $product->id, "Updated stock for {$product->name}", $changes);
                DB::afterCommit(fn () => $this->cache->flush());   // Public pages show the new availability
            }
        });

        return $this->show($productId);                            // Reload with fresh numbers
    }
}
