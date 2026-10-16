<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductBadge;
use App\Enums\SizeLabel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class ProductWriteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $create = $this->isMethod('POST');
        $req = $create ? 'required' : 'sometimes'; // Create needs everything; edit only what is sent

        return [
            'version'          => $create ? ['prohibited'] : ['required', 'integer', 'min:1'], // Edits must say which version they saw
            'category_id'      => [$req, 'integer', 'exists:categories,id'],
            'name'             => [$req, 'string', 'max:120'],
            'price'            => [$req, 'integer', 'min:100', 'max:10000000'],                // Naira, whole numbers
            'badge'            => ['nullable', Rule::enum(ProductBadge::class)],
            'description'      => [$req, 'string', 'max:2000'],
            'features'         => ['nullable', 'array', 'max:10'],
            'features.*'       => ['string', 'max:120'],
            'fabric'           => [$req, 'string', 'max:255'],
            'care'             => [$req, 'string', 'max:500'],
            'size_label'       => ['nullable', Rule::enum(SizeLabel::class)],
            'sizes'            => [$req, 'array', 'min:1', 'max:12'],
            'sizes.*'          => ['string', 'max:20', 'distinct'],
            'sold_out_sizes'   => ['nullable', 'array'],
            'sold_out_sizes.*' => ['string', 'max:20'],
            'colors'           => [$req, 'array', 'min:1', 'max:20'],
            'colors.*.name'    => ['required', 'string', 'max:40', 'distinct:ignore_case'],
            'colors.*.hex'     => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],                    // e.g. #1a1a1f
            'is_featured'      => ['sometimes', 'boolean'],
            'is_sold_out'      => ['sometimes', 'boolean'],
            'is_published'     => ['sometimes', 'boolean'],
        ];
    }

    // The fields to save (everything validated except the version)
    public function payload(): array
    {
        return Arr::except($this->validated(), ['version']);
    }

    public function version(): int
    {
        return (int) $this->validated('version');
    }
}
