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
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\UniqueConstraintViolationException;

class OrderService
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private ProductRepositoryInterface $products,
    ) {}

    // Turn a cart into an order. Every price and option is checked against the database.

        public function place(User $user, CheckoutData $data, ?string $idempotencyKey = null): Order
        {
        // Same attempt seen before? Return the order we already made.
        if ($idempotencyKey && $existing = $this->orders->findByIdempotencyKey($user, $idempotencyKey)) {
            return $existing;
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

        $deliveryFee = $this->deliveryFee($subtotal, $data->state);

                try {
            return $this->orders->create($user, [
                'status'          => OrderStatus::Pending,
                'subtotal'        => $subtotal,
                'delivery_fee'    => $deliveryFee,
                'total'           => $subtotal + $deliveryFee,
                'recipient_name'  => $data->recipientName,
                'phone'           => $data->phone,
                'address'         => $data->address,
                'city'            => $data->city,
                'state'           => $data->state,
                'idempotency_key' => $idempotencyKey,   // Saved so repeats can be recognised
            ], $items);
        } catch (UniqueConstraintViolationException $e) {
            // Two identical requests raced: the other one won, so return its order
            return ($idempotencyKey ? $this->orders->findByIdempotencyKey($user, $idempotencyKey) : null) ?? throw $e;
        }
    }

    public function listFor(User $user): Collection
    {
        return $this->orders->forUser($user);
    }

    public function findFor(User $user, string $reference): Order
    {
        return $this->orders->findForUser($user, $reference) ?? throw new ModelNotFoundException(); // Becomes a 404
    }

    // Free delivery over the threshold, otherwise a flat fee by state
    private function deliveryFee(int $subtotal, string $state): int
    {
        if ($subtotal >= config('shop.free_delivery_over')) {
            return 0;
        }

        return strcasecmp(trim($state), 'Lagos') === 0
            ? config('shop.delivery_fee_lagos')
            : config('shop.delivery_fee_other');
    }

    // Reject lines that don't match a real, available product option
    private function assertBuyable(?Product $product, CartLineData $line, int $index): void
    {
        $problem = match (true) {
            $product === null || $product->is_sold_out
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
