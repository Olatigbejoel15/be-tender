<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockRowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'product'  => ['id' => $this->product->id, 'name' => $this->product->name, 'slug' => $this->product->slug],
            'color'    => $this->color,
            'size'     => $this->size,
            'quantity' => $this->quantity,
        ];
    }
}
