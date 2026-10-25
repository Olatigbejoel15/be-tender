<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
        public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'phone'     => $this->phone,
            'role'      => $this->role?->value ?? 'customer', // "customer" | "admin" | "super_admin"; the UI uses it to choose screens
            'createdAt' => $this->created_at?->toIso8601String(),
        ]; // Never include the password hash
    }
}
