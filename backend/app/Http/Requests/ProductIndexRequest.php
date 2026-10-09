<?php

namespace App\Http\Requests;

use App\DTOs\ProductFilterData;
use App\Enums\ProductSort;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;                                                  // public endpoint
    }

    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:50'],           // category slug
            'featured' => ['nullable', 'boolean'],                    // 1/0/true/false
            'search'   => ['nullable', 'string', 'max:100'],          // search text
            'sort'     => ['nullable', Rule::enum(ProductSort::class)], // only values from the enum
        ];
    }

    // Turn the validated query string into a typed object
    public function toFilters(): ProductFilterData
    {
        return new ProductFilterData(
            category: $this->validated('category'),
            featured: $this->boolean('featured'),
            search: $this->validated('search'),
            sort: $this->enum('sort', ProductSort::class),            // enum or null
        );
    }
}
