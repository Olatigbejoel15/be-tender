<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPhoto extends Model
{
    protected $fillable = ['product_id', 'color', 'position', 'public_id', 'url']; // Mass-assignable columns

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class); // Each photo belongs to one product
    }
}
