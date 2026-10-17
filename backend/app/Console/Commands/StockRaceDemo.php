<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\StockService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockRaceDemo extends Command
{
    protected $signature = 'stock:race {product : Product id} {color} {size} {--hold=0 : Seconds to keep the lock after taking 1}';

    protected $description = 'DEMO: try to buy 1 unit and hold the lock, to watch a second process wait';

    public function handle(StockService $stock): int
    {
        $product = Product::findOrFail($this->argument('product'));

        try {
            DB::transaction(function () use ($stock, $product) {
                $this->line('Trying to take 1 unit...');
                $stock->reserve([[
                    'product_id' => $product->id, 'name' => $product->name,
                    'color' => $this->argument('color'), 'size' => $this->argument('size'), 'quantity' => 1,
                ]]);
                $this->info('GOT IT. Holding the lock for ' . $this->option('hold') . 's...');
                sleep((int) $this->option('hold'));  // Keep the transaction open so the other window has to wait
            });
            $this->info('COMMITTED: bought 1.');
        } catch (ValidationException $e) {
            $this->error('REFUSED: ' . collect($e->errors())->flatten()->first());
        }

        return self::SUCCESS;
    }
}
