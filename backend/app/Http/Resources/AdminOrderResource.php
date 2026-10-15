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
            'customer' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id, 'name' => $this->user->name,
                'email' => $this->user->email, 'phone' => $this->user->phone,
            ]),
            'nextStatuses' => collect($this->status->allowedNext())      // What the admin may choose next
                ->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()])->all(),
            'history' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
        ];
    }
}
