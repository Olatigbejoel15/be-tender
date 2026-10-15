<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Enums\OrderStatus;

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

        public function findByReference(string $reference): ?Order
    {
        return Order::with('items')->where('reference', $reference)->first();
    }

    public function attachPaymentReference(Order $order, string $paymentReference): void
    {
        $order->update(['payment_reference' => $paymentReference]);
    }

    public function markPaid(Order $order, string $paymentReference): bool
    {
        return Order::where('id', $order->id)
            ->where('status', OrderStatus::Pending->value)   // Only if still pending, so a double call does nothing
            ->update([
                'status'            => OrderStatus::Paid->value,
                'payment_reference' => $paymentReference,
                'paid_at'           => now(),
            ]) === 1;
    }

        public function findByIdempotencyKey(User $user, string $key): ?Order
    {
        return Order::with('items')
            ->where('user_id', $user->id)       // Keys are per customer
            ->where('idempotency_key', $key)
            ->first();
    }
}
