<?php

namespace App\Http\Requests;

use App\DTOs\CartLineData;
use App\DTOs\CheckoutData;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The route already requires a signed-in user
    }

    public function rules(): array
    {
        return [
            'recipient_name'     => ['required', 'string', 'max:100'],
            'phone'              => ['required', 'string', 'max:20'],
            'address'            => ['required', 'string', 'max:255'],
            'city'               => ['required', 'string', 'max:100'],
            'state'              => ['required', 'string', 'max:100'],
            'items'              => ['required', 'array', 'min:1', 'max:30'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.color'      => ['required', 'string', 'max:50'],
            'items.*.size'       => ['required', 'string', 'max:50'],
            'items.*.quantity'   => ['required', 'integer', 'min:1', 'max:' . config('shop.max_qty')],
            // No price field on purpose: the server decides prices
        ];
    }

    // Turn the validated input into typed objects
    public function toData(): CheckoutData
    {
        $v = $this->validated();

        return new CheckoutData(
            recipientName: trim($v['recipient_name']),
            phone: trim($v['phone']),
            address: trim($v['address']),
            city: trim($v['city']),
            state: trim($v['state']),
            lines: array_map(
                fn (array $i) => new CartLineData((int) $i['product_id'], $i['color'], $i['size'], (int) $i['quantity']),
                $v['items']
            ),
        );
    }
}
