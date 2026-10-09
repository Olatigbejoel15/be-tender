<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->images ?? [];                                  // list of photo paths

        return [
            'id'          => $this->id,
            'slug'        => $this->slug,
            'name'        => $this->name,
            'category'    => $this->whenLoaded('category', fn () => $this->category->name),
            'price'       => $this->price,
            'image'       => $images[0] ?? '/products/placeholder.svg',
            'gallery'     => array_slice($images, 1),
            'badge'       => $this->badge?->value,                      // enum -> plain text, or null
            'description' => $this->description,
            'features'    => $this->features ?? [],
            'fabric'      => $this->fabric,
            'care'        => $this->care,
            'sizeLabel'   => $this->size_label?->value,                 // enum -> plain text
            'sizes'       => $this->sizes,
            'soldOut'     => $this->sold_out_sizes ?? [],
            'colors'      => $this->colors,
            'isSoldOut'   => $this->is_sold_out,
            'isFeatured'  => $this->is_featured,
        ];
    }
}
