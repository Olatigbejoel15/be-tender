<?php

namespace App\Models;

use App\Enums\ProductBadge;
use App\Enums\SizeLabel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'price', 'badge', 'fabric',
        'care', 'features', 'sizes', 'size_label', 'sold_out_sizes', 'colors',
        'images', 'is_sold_out', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'badge'          => ProductBadge::class,  // text in DB <-> enum in code
            'size_label'     => SizeLabel::class,
            'features'       => 'array',
            'sizes'          => 'array',
            'sold_out_sizes' => 'array',
            'colors'         => 'array',
            'images'         => 'array',
            'is_sold_out'    => 'boolean',
            'is_featured'    => 'boolean',
            'price'          => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
