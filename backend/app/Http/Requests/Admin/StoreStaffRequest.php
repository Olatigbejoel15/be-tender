<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The route's can:manage-staff middleware already checks
    }

    public function rules(): array
    {
        return [
            'name'     => ['nullable', 'string', 'max:255'],           // Needed only for a brand-new account
            'email'    => ['required', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:8', 'max:72'],   // Same
            'role'     => ['required', Rule::in(['admin', 'super_admin'])],
        ];
    }

        // Same casing the login and registration use, so lookups always match
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }
}
