<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock'         => ['required', 'array', 'min:1', 'max:200'],
            'stock.*.color' => ['required', 'string', 'max:40'],
            'stock.*.size'  => ['required', 'string', 'max:20'],
            // Each entry sets an exact number ("set") OR changes it by an amount ("add"), never both
            'stock.*.set'   => ['nullable', 'integer', 'min:0', 'max:100000', 'required_without:stock.*.add', 'prohibits:stock.*.add'],
            'stock.*.add'   => ['nullable', 'integer', 'min:-100000', 'max:100000', 'required_without:stock.*.set', 'prohibits:stock.*.set'],
        ];
    }

    public function entries(): array
    {
        return $this->validated('stock');
    }
}
