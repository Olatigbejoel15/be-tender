<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderRepository implements OrderRepositoryInterface
{
    public function create(User $user, array $attributes, array $items): Order
    {
        return DB::transaction(function () use ($user, $attributes, $items) { // If anything fails, nothing is saved
            $order = Order::create([
                ...$attributes,
                'user_id'   => $user->id,
                'reference' => $this->newReference(),
            ]);

            $order->items()->createMany($items); // One row per cart line

            return $order->load('items');
        });
    }

    public function forUser(User $user): Collection
    {
        return Order::with('items')->where('user_id', $user->id)->latest()->get();
    }

    public function findForUser(User $user, string $reference): ?Order
    {
        return Order::with('items')
            ->where('user_id', $user->id)   // Never show someone else's order
            ->where('reference', $reference)
            ->first();
    }

    // A short readable code like BT-7K3M9QXA, checked for uniqueness
    private function newReference(): string
    {
        do {
            $reference = 'BT-' . strtoupper(Str::random(8));
        } while (Order::where('reference', $reference)->exists());

        return $reference;
    }
}
