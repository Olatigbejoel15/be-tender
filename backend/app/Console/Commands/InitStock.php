<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductStock;
use App\Services\CatalogueCache;
use Illuminate\Console\Command;

class InitStock extends Command
{
    protected $signature = 'stock:init {--quantity=20 : Starting quantity for each option} {--only= : One product slug}';

    protected $description = 'Create stock rows (default 20 each) for products that have none. Existing rows are not touched.';

    public function handle(CatalogueCache $cache): int
    {
        $quantity = max(0, (int) $this->option('quantity'));
        $created = 0;

        $products = Product::query()->when($this->option('only'), fn ($q, $slug) => $q->where('slug', $slug))->get();

        foreach ($products as $product) {
            foreach ($product->colors ?? [] as $color) {
                foreach ($product->sizes ?? [] as $size) {
                    $row = ProductStock::firstOrCreate(                       // Only creates what is missing
                        ['product_id' => $product->id, 'color' => $color['name'], 'size' => $size],
                        ['quantity' => $quantity]
                    );
                    $created += $row->wasRecentlyCreated ? 1 : 0;
                }
            }
        }

        $cache->flush(); // Public pages pick up the new availability

        $this->info("Created {$created} stock rows with {$quantity} each. Replace these placeholders with real counts in the admin.");

        return self::SUCCESS;
    }
}
