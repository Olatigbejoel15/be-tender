<?php

namespace Tests\Concerns;

use App\Models\Product;
use App\Models\ProductStock;

trait CreatesShopData
{
    // A product plus a stock row for every colour x size
    protected function makeProduct(array $attributes = [], int $stock = 10): Product
    {
        $product = Product::factory()->create($attributes);

        foreach ($product->colors as $color) {
            foreach ($product->sizes as $size) {
                ProductStock::create([
                    'product_id' => $product->id, 'color' => $color['name'], 'size' => $size, 'quantity' => $stock,
                ]);
            }
        }

        return $product;
    }

    // Units left for one option (reads the database, not a cached model)
    protected function stockOf(Product $product, string $color = 'Black', string $size = 'M'): int
    {
        return (int) ProductStock::where(['product_id' => $product->id, 'color' => $color, 'size' => $size])->value('quantity');
    }

    // A valid guest checkout body for one line (Black / M / qty 1). Override any top-level key.
    protected function checkoutPayload(Product $product, array $overrides = []): array
    {
        return [
            'email'          => 'guest@example.com',
            'recipient_name' => 'Test Buyer',
            'phone'          => '08012345678',
            'address'        => '12 Test Street',
            'city'           => 'Ikeja',
            'state'          => 'Lagos',
            'items'          => [['product_id' => $product->id, 'color' => 'Black', 'size' => 'M', 'quantity' => 1]],
            ...$overrides,
        ];
    }
}