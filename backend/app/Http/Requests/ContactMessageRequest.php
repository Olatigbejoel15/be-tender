<?php

namespace App\Http\Requests;
use App\DTOs\ContactMessageData;

use Illuminate\Foundation\Http\FormRequest;

class ContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public form
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => strtolower(trim((string) $this->input('email')))]); // same casing everywhere
    }

    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'max:100'],
            'email'   => ['required', 'email', 'max:255'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'topic'   => ['required', 'string', 'max:60'],
            'message' => ['required', 'string', 'min:5', 'max:2000'],
            'website' => ['nullable', 'string', 'max:255'], // honeypot: hidden field real people leave empty
        ];
    }

        // The validated input as a typed object
    public function messageData(): ContactMessageData
    {
        return new ContactMessageData(
            name: $this->validated('name'),
            email: $this->validated('email'),
            phone: $this->validated('phone'),
            topic: $this->validated('topic'),
            message: $this->validated('message'),
            honeypot: $this->validated('website'),
        );
    }
}