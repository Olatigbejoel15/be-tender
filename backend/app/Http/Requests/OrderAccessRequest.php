<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ownership is checked in the service, not here
    }

    public function rules(): array
    {
        return [
            // Guests prove ownership with the order's email; signed-in customers don't need it
            'email' => [Rule::requiredIf(fn () => $this->user('sanctum') === null), 'nullable', 'email', 'max:255'],
        ];
    }

    public function email(): ?string
    {
        $email = $this->validated('email');

        return $email ? mb_strtolower(trim($email)) : null; // Same casing the order was saved with
    }
}
