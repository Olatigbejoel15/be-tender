<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ProductStock;
use App\Repositories\Contracts\StockRepositoryInterface;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function __construct(private StockRepositoryInterface $stock) {}

    // Take stock for an order's lines. MUST run inside a DB transaction (the locks last until it ends).
    public function reserve(array $items): void
    {
        $needs = []; // key => total wanted for that option (the same option can appear twice)

        foreach ($items as $index => $item) {
            $key = ProductStock::key($item['product_id'], $item['color'], $item['size']);
            $needs[$key] ??= [
                'product_id' => $item['product_id'], 'color' => $item['color'], 'size' => $item['size'],
                'name' => $item['name'], 'qty' => 0, 'index' => $index,
            ];
            $needs[$key]['qty'] += $item['quantity'];
        }

        $rows = $this->stock->lockVariants(array_values($needs)); // Lock first, THEN read: nobody can sneak in between

        foreach ($needs as $key => $need) {                       // Check everything before changing anything
            $left = $rows->get($key)?->quantity ?? 0;

            if ($left < $need['qty']) {
                $label = "{$need['name']} ({$need['color']}, {$need['size']})";
                throw ValidationException::withMessages([
                    "items.{$need['index']}" => [$left === 0 ? "{$label} is sold out." : "Only {$left} left of {$label}."],
                ]);
            }
        }

        foreach ($needs as $key => $need) {
            $this->stock->change($rows->get($key), -$need['qty']); // Take it off the shelf
        }
    }

    // Put an order's stock back (cancelled). MUST run inside a DB transaction.
    public function release(Order $order): void
    {
        if ($order->stock_reserved_at === null) {
            return; // This order never took stock (placed before stock tracking, or already released)
        }

        $totals = [];

        foreach ($order->items()->get() as $item) {
            if ($item->product_id === null) {
                continue;
            }
            $key = ProductStock::key($item->product_id, $item->color, $item->size);
            $totals[$key] ??= ['product_id' => $item->product_id, 'color' => $item->color, 'size' => $item->size, 'qty' => 0];
            $totals[$key]['qty'] += $item->quantity;
        }

        $rows = $this->stock->lockVariants(array_values($totals));

        foreach ($totals as $key => $t) {
            if ($row = $rows->get($key)) {
                $this->stock->change($row, $t['qty']); // Back on the shelf
            }
        }

        $order->forceFill(['stock_reserved_at' => null])->save(); // Never release the same order twice
    }
}
