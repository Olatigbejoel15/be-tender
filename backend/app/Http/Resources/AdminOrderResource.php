<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminOrderResource extends OrderResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request), // Everything the customer sees, plus:
            'paymentReference' => $this->payment_reference,
            'needsRefund'      => $this->refund_needed_at !== null, // A customer paid for a cancelled order
            'customer' => [
                'id'      => $this->user_id,                              // null for guests
                'name'    => $this->user?->name ?? $this->recipient_name, // Guests: the delivery name
                'email'   => $this->email,
                'phone'   => $this->user?->phone ?? $this->phone,
                'isGuest' => $this->user_id === null,
            ],
            'nextStatuses' => collect($this->status->allowedNext())      // What the admin may choose next
                ->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()])->all(),
            'history' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
        ];
    }
}
