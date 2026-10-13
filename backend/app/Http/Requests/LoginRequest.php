<?php

namespace App\Http\Requests;

use App\DTOs\LoginData;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function toData(): LoginData
    {
        return new LoginData(
            email: strtolower($this->validated('email')),
            password: $this->validated('password'),
        );
    }
}
