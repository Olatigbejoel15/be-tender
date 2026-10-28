<?php

namespace App\Repositories\Eloquent;

use App\DTOs\OrderFilterData;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderRepository implements OrderRepositoryInterface
{
    public function create(?User $user, array $attributes, array $items): Order
    {
        return DB::transaction(function () use ($user, $attributes, $items) { // If anything fails, nothing is saved
            $order = Order::create([
                ...$attributes,
                'user_id'   => $user?->id,         // null = guest
                'reference' => $this->newReference(),
            ]);

            $order->items()->createMany($items); // One row per cart line
            $order->statusHistories()->create([
                'user_id' => $user?->id, 'from_status' => null, 'to_status' => $order->status,
                'note' => $user ? 'Order placed' : 'Order placed (guest checkout)',
            ]); // First entry in the timeline

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

    public function findForCustomer(?User $user, ?string $email, string $reference): ?Order
    {
        if ($user) {
            return $this->findForUser($user, $reference);               // Account owner
        }

        if (! $email) {
            return null;                                                // A guest must give the email
        }

        return Order::with('items')
            ->whereNull('user_id')                                      // Guest orders only
            ->where('reference', $reference)
            ->where('email', $email)                                    // Wrong email = same as "not found"
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
        return DB::transaction(function () use ($order, $paymentReference) { // Status + history saved together
            $changed = Order::where('id', $order->id)
                ->where('status', OrderStatus::Pending->value)   // Only if still pending, so a double call does nothing
                ->update([
                    'status'            => OrderStatus::Paid->value,
                    'payment_reference' => $paymentReference,
                    'paid_at'           => now(),
                ]) === 1;

            if ($changed) {
                OrderStatusHistory::create([
                    'order_id' => $order->id, 'user_id' => null, // null = done by the system
                    'from_status' => OrderStatus::Pending, 'to_status' => OrderStatus::Paid,
                    'note' => 'Payment confirmed by Paystack',
                ]);
            }

            return $changed;
        });
    }

        public function flagLatePayment(Order $order, string $paymentReference): bool
    {
        return DB::transaction(function () use ($order, $paymentReference) {
            $flagged = Order::where('id', $order->id)
                ->where('status', OrderStatus::Cancelled->value)  // Only cancelled orders
                ->whereNull('refund_needed_at')                   // Only the first call counts (webhook retries do nothing)
                ->update(['refund_needed_at' => now(), 'payment_reference' => $paymentReference]) === 1;

            if ($flagged) {
                OrderStatusHistory::create([
                    'order_id' => $order->id, 'user_id' => null,  // null = the system
                    'from_status' => OrderStatus::Cancelled, 'to_status' => OrderStatus::Cancelled,
                    'note' => "Payment {$paymentReference} arrived after the order was cancelled. Refund needed.",
                ]);
            }

            return $flagged;
        });
    }

    public function findByIdempotencyKey(?User $user, string $email, string $key): ?Order
    {
        $query = Order::with('items')->where('idempotency_key', $key);

        return ($user
            ? $query->where('user_id', $user->id)                       // Keys are per customer
            : $query->whereNull('user_id')->where('email', $email)      // Guests: per email
        )->first();
    }

    public function countPendingForEmail(string $email): int
    {
        return Order::where('email', $email)->where('status', OrderStatus::Pending)->count();
    }

    public function paginateForAdmin(OrderFilterData $filters): LengthAwarePaginator
    {
        return Order::with(['items', 'user'])
            ->when($filters->status, fn ($q, $status) => $q->where('status', $status->value)) // By stage
            ->when($filters->search, function ($q, $term) {
                $q->where(function ($w) use ($term) {                                          // Grouped, so the ORs stay together
                    $w->where('reference', 'like', "%{$term}%")
                      ->orWhere('recipient_name', 'like', "%{$term}%")
                      ->orWhere('phone', 'like', "%{$term}%")
                      ->orWhere('email', 'like', "%{$term}%");                                 // Works for guests too
                });
            })
            ->when($filters->from, fn ($q, $date) => $q->whereDate('created_at', '>=', $date)) // From date
            ->when($filters->to, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))   // To date
            ->latest()
            ->paginate($filters->perPage);
    }

    public function findForAdmin(string $reference): ?Order
    {
        return Order::with(['items', 'user', 'statusHistories.user'])->where('reference', $reference)->first();
    }

    public function lockByReference(string $reference): ?Order
    {
        return Order::where('reference', $reference)->lockForUpdate()->first(); // Others wait until our transaction ends
    }

    public function recordStatus(Order $order, OrderStatus $to, ?User $actor, ?string $note): void
    {
        $from = $order->status;                       // Remember where it was
        $order->update(['status' => $to]);            // Move it
        $order->statusHistories()->create([           // Log it
            'user_id' => $actor?->id, 'from_status' => $from, 'to_status' => $to, 'note' => $note,
        ]);
    }

    public function expiredPendingReferences(\Carbon\CarbonInterface $before, int $limit): array
    {
        return Order::where('status', OrderStatus::Pending)
            ->where('created_at', '<', $before)
            ->orderBy('id')->limit($limit)   // Oldest first, in batches
            ->pluck('reference')->all();
    }
}
