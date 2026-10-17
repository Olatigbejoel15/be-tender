<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'role'      => $this->role->value,                 // enum -> text
            'isActive'  => (bool) $this->is_active,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
