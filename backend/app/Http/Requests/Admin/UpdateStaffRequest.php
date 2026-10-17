<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role'      => ['required_without:is_active', Rule::in(['customer', 'admin', 'super_admin'])], // "customer" = remove from staff
            'is_active' => ['required_without:role', 'boolean'],
        ];
    }

    public function changes(): array
    {
        return $this->validated(); // Only the fields that were sent
    }
}
