<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;

class OrderExpiryService
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private StockService $stock,
        private CatalogueCache $cache,
    ) {}

    // Cancel unpaid orders older than $minutes. Returns how many were cancelled.
    public function expire(int $minutes): int
    {
        $references = $this->orders->expiredPendingReferences(now()->subMinutes($minutes), 200); // Batch of 200 per run
        $cancelled = 0;

        foreach ($references as $reference) {
            $done = DB::transaction(function () use ($reference, $minutes) {
                $order = $this->orders->lockByReference($reference);   // Lock the row, then re-check

                if (! $order || $order->status !== OrderStatus::Pending) {
                    return false;                                      // Paid or changed since we looked: leave it
                }

                $this->orders->recordStatus($order, OrderStatus::Cancelled, null, "Expired: not paid within {$minutes} minutes"); // null = System
                $this->stock->release($order);                         // Stock back on the shelf

                return true;
            }, 3);

            $cancelled += $done ? 1 : 0;
        }

        if ($cancelled > 0) {
            $this->cache->flush();                                     // Public pages show the stock again
        }

        return $cancelled;
    }
}
