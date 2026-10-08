<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'price', 'fabric',
        'care', 'features', 'sizes', 'colors', 'images', 'is_sold_out', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'features'    => 'array',   // JSON in DB <-> PHP array in code
            'sizes'       => 'array',
            'colors'      => 'array',
            'images'      => 'array',
            'is_sold_out' => 'boolean',
            'is_featured' => 'boolean',
            'price'       => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);         // $product->category
    }
}
