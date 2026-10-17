<?php

namespace App\Http\Resources;

use App\Models\ProductStock;
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

        [$soldOutByColor, $soldOutSizes, $allSoldOut] = $this->availability();

        return [
            'id'             => $this->id,
            'slug'           => $this->slug,
            'name'           => $this->name,
            'category'       => $this->whenLoaded('category', fn () => $this->category->name),
            'price'          => $this->price,
            'image'          => $main,
            'gallery'        => array_slice($gallery, 1),               // Photos after the main one
            'badge'          => $this->badge?->value,                   // enum -> plain text, or null
            'description'    => $this->description,
            'features'       => $this->features ?? [],
            'fabric'         => $this->fabric,
            'care'           => $this->care,
            'sizeLabel'      => $this->size_label?->value,              // enum -> plain text
            'sizes'          => $this->sizes,
            'soldOut'        => $soldOutSizes,                          // Sizes unavailable in EVERY colour
            'soldOutByColor' => (object) $soldOutByColor,               // {"Black": ["XL"], ...} (counts are never exposed)
            'colors'         => $colors,
            'isSoldOut'      => $this->is_sold_out || $allSoldOut,      // Manual switch, or nothing left at all
            'isFeatured'     => $this->is_featured,
        ];
    }

    // Which options can't be bought right now: [by colour, sold-out sizes, everything sold out?]
    private function availability(): array
    {
        $manual = $this->sold_out_sizes ?? [];                          // Sizes an admin switched off by hand

        if (! $this->relationLoaded('stocks')) {
            return [[], $manual, false];                                // Stock not loaded: fall back to the manual flags
        }

        $qty = $this->stocks->mapWithKeys(                              // key => quantity
            fn ($s) => [ProductStock::key($s->product_id, $s->color, $s->size) => $s->quantity]
        );

        $colors = $this->colors ?? [];
        $sizes  = $this->sizes ?? [];
        $byColor = [];
        $outCount = 0;

        foreach ($colors as $c) {
            foreach ($sizes as $size) {
                $out = ($qty[ProductStock::key($this->id, $c['name'], $size)] ?? 0) <= 0 || in_array($size, $manual, true);

                if ($out) {
                    $byColor[$c['name']][] = $size;
                    $outCount++;
                }
            }
        }

        $soldOutSizes = array_values(array_filter($sizes, function ($size) use ($byColor, $colors) {
            return $colors !== [] && count(array_filter($byColor, fn ($list) => in_array($size, $list, true))) === count($colors);
        }));

        return [$byColor, $soldOutSizes, $colors !== [] && $outCount === count($colors) * count($sizes)];
    }
}
