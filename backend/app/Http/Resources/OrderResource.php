<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'reference'     => $this->reference,
            'email'         => $this->email, // Where receipts go
            'status'        => $this->status->value,
            'statusLabel'   => $this->status->label(),
            'subtotal'      => $this->subtotal,
            'deliveryFee'   => $this->delivery_fee,
            'total'         => $this->total,
            'recipientName' => $this->recipient_name,
            'phone'         => $this->phone,
            'address'       => $this->address,
            'city'          => $this->city,
            'state'         => $this->state,
            'paidAt'        => $this->paid_at?->toIso8601String(),
            'createdAt'     => $this->created_at?->toIso8601String(),
            'items'         => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
