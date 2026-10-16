<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photo'    => ['required', 'file', 'image', 'mimes:png,jpg,jpeg,webp', 'max:5120'], // Real image, 5 MB max
            'color'    => ['nullable', 'string', 'max:40'],                                      // Set for a colour photo
            'position' => ['nullable', 'integer', 'min:1', 'max:6'],                             // Gallery slot (when no colour)
        ];
    }
}
