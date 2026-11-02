<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public endpoint
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => strtolower(trim((string) $this->input('email')))]); // same casing as stored emails
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'], // no "exists" rule: it would reveal who has an account
        ];
    }
}