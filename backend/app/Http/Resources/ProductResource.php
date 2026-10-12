<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $local = $this->images ?? [];                                   // Old local photo paths (fallback)
        $photos = $this->relationLoaded('photos') ? $this->photos : collect(); // Cloudinary rows
        $byColor = $photos->whereNotNull('color')->pluck('url', 'color');       // "black" => url
        $gallery = $photos->whereNull('color')->sortBy('position')->pluck('url')->values()->all();

        $colors = collect($this->colors ?? [])->map(fn ($c) => [
            ...$c,                                                      // name, hex, old image
            'image' => $byColor[Str::slug($c['name'])] ?? ($c['image'] ?? null), // Cloudinary first
        ])->all();

        $main = $gallery[0] ?? $byColor['black'] ?? $byColor->first()   // Main, else black, else any colour
            ?? ($local[0] ?? '/products/placeholder.svg');

        return [
            'id'          => $this->id,
            'slug'        => $this->slug,
            'name'        => $this->name,
            'category'    => $this->whenLoaded('category', fn () => $this->category->name),
            'price'       => $this->price,
            'image'       => $main,
            'gallery'     => array_slice($gallery, 1),                  // Photos after the main one
            'badge'       => $this->badge?->value,                      // enum -> plain text, or null
            'description' => $this->description,
            'features'    => $this->features ?? [],
            'fabric'      => $this->fabric,
            'care'        => $this->care,
            'sizeLabel'   => $this->size_label?->value,                 // enum -> plain text
            'sizes'       => $this->sizes,
            'soldOut'     => $this->sold_out_sizes ?? [],
            'colors'      => $colors,
            'isSoldOut'   => $this->is_sold_out,
            'isFeatured'  => $this->is_featured,
        ];
    }
}
