<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name'      => $this->name,
            'color'     => $this->color,
            'size'      => $this->size,
            'image'     => $this->image,
            'unitPrice' => $this->unit_price,
            'quantity'  => $this->quantity,
            'lineTotal' => $this->unit_price * $this->quantity,
        ];
    }
}
