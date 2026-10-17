<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use App\DTOs\OrderFilterData;
use App\Enums\OrderStatus;
use Illuminate\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    // Save an order and its lines together (all or nothing)
    public function create(User $user, array $attributes, array $items): Order;

    public function forUser(User $user): Collection;                        // All of one customer's orders, newest first

    public function findForUser(User $user, string $reference): ?Order;     // One order, only if it belongs to them

    public function findByReference(string $reference): ?Order;                // Find any order by its BT- code (webhook use)

    public function attachPaymentReference(Order $order, string $paymentReference): void; // Save the live payment attempt

    public function markPaid(Order $order, string $paymentReference): bool;    // Pending -> paid, once only

    public function findByIdempotencyKey(User $user, string $key): ?Order; // Order already made for this attempt, if any

    public function paginateForAdmin(OrderFilterData $filters): LengthAwarePaginator;     // Filtered, paged list for staff

    public function findForAdmin(string $reference): ?Order;                              // One order with customer + history

    public function lockByReference(string $reference): ?Order;                           // Fetch AND lock the row (use inside a transaction)

    // public function recordStatus(Order $order, OrderStatus $to, User $actor, ?string $note): void; // Change status + log it
    public function recordStatus(Order $order, OrderStatus $to, ?User $actor, ?string $note): void; // null actor = System

    public function expiredPendingReferences(\Carbon\CarbonInterface $before, int $limit): array; // Unpaid orders older than $before
}
