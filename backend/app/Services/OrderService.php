<?php

namespace App\Services;

use App\DTOs\CartLineData;
use App\DTOs\CheckoutData;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use App\DTOs\DeliveryUpdateData;

class OrderService
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private ProductRepositoryInterface $products,
        private StockService $stock,       // Reserves stock under a lock
        private CatalogueCache $cache,     // Refreshed when stock changes
        private DeliveryService $delivery, // Fee by delivery zone
    ) {}

    // Turn a cart into an order. Every price and option is checked against the database.
    public function place(?User $user, CheckoutData $data, ?string $idempotencyKey = null): Order
    {
        // Same attempt seen before? Return the order we already made.
        if ($idempotencyKey && $existing = $this->orders->findByIdempotencyKey($user, $data->email, $idempotencyKey)) {
            return $existing;
        }

        // Cap unpaid orders per email so nobody can hoard stock without paying
        if ($this->orders->countPendingForEmail($data->email) >= config('shop.max_pending_per_email', 3)) {
            throw new TooManyRequestsHttpException(null, 'You have unpaid orders waiting. Please pay for them, or wait for them to expire, before placing another.');
        }

        $found = $this->products->findManyByIds(
            collect($data->lines)->pluck('productId')->unique()->values()->all()
        );

        $items = [];
        $subtotal = 0;

        foreach ($data->lines as $index => $line) {
            $product = $found->get($line->productId);
            $this->assertBuyable($product, $line, $index);

            $items[] = [
                'product_id' => $product->id,
                'name'       => $product->name,                          // Copied, so history never changes
                'color'      => $line->color,
                'size'       => $line->size,
                'image'      => $this->photoFor($product, $line->color), // That colour's photo, if any
                'unit_price' => $product->price,                         // From the database, never from the browser
                'quantity'   => $line->quantity,
            ];
            $subtotal += $product->price * $line->quantity;
        }

            $deliveryFee = $this->delivery->fee($subtotal, $data->state);

        try {
            return DB::transaction(function () use ($user, $data, $items, $subtotal, $deliveryFee, $idempotencyKey) {
                $this->stock->reserve($items); // Lock, check and take the stock (throws a 422 if short)

                $order = $this->orders->create($user, [
                    'email'             => $data->email,          // Receipts and lookups use this
                    'status'            => OrderStatus::Pending,
                    'subtotal'          => $subtotal,
                    'delivery_fee'      => $deliveryFee,
                    'total'             => $subtotal + $deliveryFee,
                    'recipient_name'    => $data->recipientName,
                    'phone'             => $data->phone,
                    'address'           => $data->address,
                    'city'              => $data->city,
                    'state'             => $data->state,
                    'idempotency_key'   => $idempotencyKey,   // Saved so repeats can be recognised
                    'stock_reserved_at' => now(),             // This order holds stock until it is cancelled
                ], $items);

                DB::afterCommit(fn () => $this->cache->flush()); // Availability changed: refresh public pages

                return $order;
            }, 3); // Retry up to 3 times if MySQL reports a deadlock
        } catch (UniqueConstraintViolationException $e) {
            // Two identical requests raced: the other one won, so return its order
            return ($idempotencyKey ? $this->orders->findByIdempotencyKey($user, $data->email, $idempotencyKey) : null) ?? throw $e;
        }
    }

    public function listFor(User $user): Collection
    {
        return $this->orders->forUser($user);
    }

    // Account owner, or a guest who knows the order's email
    public function findFor(?User $user, string $reference, ?string $email = null): Order
    {
        return $this->orders->findForCustomer($user, $email, $reference) ?? throw new ModelNotFoundException(); // Becomes a 404
    }

        // Customer fixes the delivery details while the order is still unpaid
    public function updateDelivery(?User $user, string $reference, ?string $email, DeliveryUpdateData $data): Order
    {
        $this->findFor($user, $reference, $email); // ownership first: someone else's order = 404

        return DB::transaction(function () use ($reference, $data) {
            $order = $this->orders->lockByReference($reference); // others wait: no clash with a payment landing now

            if ($order->status !== OrderStatus::Pending) {
                throw ValidationException::withMessages(['order' => ['This order can no longer be changed. Please contact us.']]);
            }

            $fee = $this->delivery->fee($order->subtotal, $data->state); // also rejects states we don't serve

            // A payment page for the old amount may still be open, so the total can't move after that
            if ($order->payment_reference !== null && $fee !== $order->delivery_fee) {
                throw ValidationException::withMessages(['state' => [
                    'Payment has already been started for this order, so the delivery state cannot change now. Please contact us, or place a new order once this one expires.',
                ]]);
            }

            $note = $order->state === $data->state
                ? 'Customer changed delivery details' // same state, other details
                : "Customer changed delivery state from {$order->state} to {$data->state} (delivery {$order->delivery_fee} to {$fee})";

            $updated = $this->orders->updateDelivery($order, [
                'recipient_name' => $data->recipientName,
                'phone'          => $data->phone,
                'address'        => $data->address,
                'city'           => $data->city,
                'state'          => $data->state,
                'delivery_fee'   => $fee,
                'total'          => $order->subtotal + $fee, // recalculated here, never taken from the browser
            ]);

            $this->orders->recordStatus($updated, OrderStatus::Pending, null, $note); // visible in the admin history

            return $updated;
        });
    }

    // Reject lines that don't match a real, available product option
    private function assertBuyable(?Product $product, CartLineData $line, int $index): void
    {
        $problem = match (true) {
            $product === null || $product->is_sold_out || ! $product->is_published
                => 'This product is no longer available.',
            ! collect($product->colors ?? [])->contains('name', $line->color)
                => "{$product->name} is not available in {$line->color}.",
            ! in_array($line->size, $product->sizes ?? [], true)
                => "{$product->name} does not come in {$line->size}.",
            in_array($line->size, $product->sold_out_sizes ?? [], true)
                => "{$product->name} in {$line->size} is sold out.",
            default => null,
        };

        if ($problem) {
            throw ValidationException::withMessages(["items.$index" => [$problem]]); // 422 pointing at the bad line
        }
    }

    // The Cloudinary photo for the chosen colour, or null
    private function photoFor(Product $product, string $color): ?string
    {
        return $product->photos->firstWhere('color', Str::slug($color))?->url;
    }
}
