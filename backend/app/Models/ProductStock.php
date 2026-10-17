<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductStock extends Model
{
    protected $fillable = ['product_id', 'color', 'size', 'quantity']; // Bulk-fillable columns

    protected function casts(): array
    {
        return ['quantity' => 'integer'];
    }

    // One text key per option, used everywhere to match rows: "12|Black|M"
    public static function key(int $productId, string $color, string $size): string
    {
        return "{$productId}|{$color}|{$size}";
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
