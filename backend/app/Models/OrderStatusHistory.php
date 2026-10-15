<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    public const UPDATED_AT = null; // Only created_at exists

    protected $fillable = ['order_id', 'user_id', 'from_status', 'to_status', 'note']; // Bulk-fillable columns

    protected function casts(): array
    {
        return [
            'from_status' => OrderStatus::class, // Text <-> enum
            'to_status'   => OrderStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class); // Who made the change
    }
}
