<?php

namespace App\Http\Requests;

use App\DTOs\RegisterData;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Anyone may register
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'], // One account per email
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'max:100'],
        ];
    }

    // Turn the validated input into a typed object
    public function toData(): RegisterData
    {
        return new RegisterData(
            name: trim($this->validated('name')),
            email: strtolower($this->validated('email')),
            password: $this->validated('password'),
            phone: $this->validated('phone'),
        );
    }
}
