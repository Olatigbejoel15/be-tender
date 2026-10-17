<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AnalyticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'days'  => ['nullable', 'integer', 'min:1', 'max:365'], // Look-back window
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],  // Rows in "top products"
        ];
    }

    public function days(): int
    {
        return $this->integer('days', 30);
    }

    public function limit(): int
    {
        return $this->integer('limit', 5);
    }
}
