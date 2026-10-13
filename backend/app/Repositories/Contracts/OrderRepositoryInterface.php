<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface OrderRepositoryInterface
{
    // Save an order and its lines together (all or nothing)
    public function create(User $user, array $attributes, array $items): Order;

    public function forUser(User $user): Collection;                        // All of one customer's orders, newest first

    public function findForUser(User $user, string $reference): ?Order;     // One order, only if it belongs to them
}
