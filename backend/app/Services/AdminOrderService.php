<?php

namespace App\Services;

use App\DTOs\OrderFilterData;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Events\OrderStatusChanged;


class AdminOrderService
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private StockService $stock,      // Gives stock back on cancellation
        private CatalogueCache $cache,
        ) {}

    public function list(OrderFilterData $filters): LengthAwarePaginator
    {
        return $this->orders->paginateForAdmin($filters);
    }

    public function find(string $reference): Order
    {
        return $this->orders->findForAdmin($reference) ?? throw new ModelNotFoundException(); // Becomes a 404
    }

    // Move an order to its next stage, safely even if two admins act at once
    public function changeStatus(User $actor, string $reference, OrderStatus $to, ?string $note): Order
    {
        DB::transaction(function () use ($actor, $reference, $to, $note) { // All or nothing
            $order = $this->orders->lockByReference($reference) ?? throw new ModelNotFoundException(); // Row is locked from here

            if (! $order->status->canMoveTo($to)) { // Checked against the FRESH status, after the lock
                throw ValidationException::withMessages([
                    'status' => ["An order that is {$order->status->label()} cannot be changed to {$to->label()}."],
                ]);
            }

            $this->orders->recordStatus($order, $to, $actor, $note);
            OrderStatusChanged::dispatch($order, $to); // Emails the customer for shipped / delivered / cancelled
            if ($to === OrderStatus::Cancelled) {
                $this->stock->release($order);                       // Items go back on the shelf (only if this order took stock)
                DB::afterCommit(fn () => $this->cache->flush());     // Public pages show them again
            }
        });

        return $this->find($reference); // Reload with history for the response
    }
}
