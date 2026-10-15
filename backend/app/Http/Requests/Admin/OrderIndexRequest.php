<?php

namespace App\Http\Requests\Admin;

use App\DTOs\OrderFilterData;
use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The staff middleware already protects the route
    }

    public function rules(): array
    {
        return [
            'status'   => ['nullable', Rule::enum(OrderStatus::class)], // Must be a real stage
            'search'   => ['nullable', 'string', 'max:100'],
            'from'     => ['nullable', 'date'],
            'to'       => ['nullable', 'date', 'after_or_equal:from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function filters(): OrderFilterData
    {
        $v = $this->validated();

        return new OrderFilterData(
            status: isset($v['status']) ? OrderStatus::from($v['status']) : null,
            search: $v['search'] ?? null,
            from: $v['from'] ?? null,
            to: $v['to'] ?? null,
            perPage: (int) ($v['per_page'] ?? 15),
        );
    }
}
