<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'reference', 'status', 'subtotal', 'delivery_fee', 'total',
        'recipient_name', 'phone', 'address', 'city', 'state',
        'payment_reference', 'paid_at', 'idempotency_key', 'stock_reserved_at'
    ]; // Columns we may fill in bulk

    protected function casts(): array
    {
        return [
            'status'       => OrderStatus::class, // Text <-> enum
            'subtotal'     => 'integer',
            'delivery_fee' => 'integer',
            'total'        => 'integer',
            'paid_at'      => 'datetime',
            'stock_reserved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class); // The customer who placed it
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class); // The lines in this order
    }

        public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->oldest('id'); // Oldest first reads like a timeline
    }
}
