<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminProductResource extends ProductResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),                                  // Everything the public sees, plus:
            'categoryId'  => $this->category_id,
            'isPublished' => $this->is_published,
            'version'     => $this->version,                               // Send this back when editing
            'photos'      => $this->whenLoaded('photos', fn () => $this->photos->map(fn ($p) => [
                'id' => $p->id, 'color' => $p->color, 'position' => $p->position, 'url' => $p->url,
            ])->values()),
            'stock'       => $this->whenLoaded('stocks', fn () => $this->stocks->map(fn ($s) => [
                'color' => $s->color, 'size' => $s->size, 'quantity' => $s->quantity,
            ])->values()),                                                 // Exact counts: staff only                                                // With ids, so the admin can delete one
            'updatedAt'   => $this->updated_at?->toIso8601String(),
        ];
    }
}
