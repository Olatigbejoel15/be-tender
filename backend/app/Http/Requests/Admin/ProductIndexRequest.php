<?php

namespace App\Http\Requests\Admin;

use App\DTOs\AdminProductFilterData;
use Illuminate\Foundation\Http\FormRequest;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The staff middleware already protects the route
    }

    public function rules(): array
    {
        return [
            'search'    => ['nullable', 'string', 'max:100'],
            'category'  => ['nullable', 'string', 'max:100'],
            'published' => ['nullable', 'boolean'],
            'sold_out'  => ['nullable', 'boolean'],
            'per_page'  => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function filters(): AdminProductFilterData
    {
        return new AdminProductFilterData(
            search: $this->validated('search'),
            category: $this->validated('category'),
            published: $this->has('published') ? $this->boolean('published') : null, // null = both
            soldOut: $this->has('sold_out') ? $this->boolean('sold_out') : null,
            perPage: (int) ($this->validated('per_page') ?? 15),
        );
    }
}
