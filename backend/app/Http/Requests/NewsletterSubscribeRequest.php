<?php

namespace App\Http\Requests;
use App\DTOs\NewsletterSignupData;

use Illuminate\Foundation\Http\FormRequest;

class NewsletterSubscribeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public form
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => strtolower(trim((string) $this->input('email')))]);
    }

    public function rules(): array
    {
        return [
            'email'   => ['required', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'], // honeypot
        ];
    }

            // The validated input as a typed object
    public function signupData(): NewsletterSignupData
    {
        return new NewsletterSignupData(
            email: $this->validated('email'),
            honeypot: $this->validated('website'),
        );
    }
}