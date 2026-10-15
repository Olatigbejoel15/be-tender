<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderStatusHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'from'      => $this->from_status?->value,
            'to'        => $this->to_status->value,
            'toLabel'   => $this->to_status->label(),
            'note'      => $this->note,
            'by'        => $this->user?->name ?? 'System', // Null user = automatic (e.g. payment)
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
