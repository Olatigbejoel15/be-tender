<?php

namespace App\Http\Requests;

use App\DTOs\CartLineData;
use App\DTOs\CheckoutData;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Open to guests and signed-in customers
    }

    public function rules(): array
    {
        return [
            'email'              => ['required', 'email:rfc', 'max:255'], // Receipt + payment email
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
            'idempotency_key'    => ['nullable', 'string', 'regex:/^[A-Za-z0-9_-]{8,64}$/'], // From the header
            // No price field on purpose: the server decides prices
        ];
    }

    // Turn the validated input into typed objects
    public function toData(): CheckoutData
    {
        $v = $this->validated();

        return new CheckoutData(
            recipientName: trim($v['recipient_name']),
            email: mb_strtolower(trim($v['email'])), // Lowercase so lookups match
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

    // Copy the header into the input, and force the account email for signed-in customers
    protected function prepareForValidation(): void
    {
        $this->merge([
            'idempotency_key' => $this->header('Idempotency-Key'),
            ...($this->user('sanctum') ? ['email' => $this->user('sanctum')->email] : []),
        ]);
    }

    // The validated key, or null if the client didn't send one
    public function idempotencyKey(): ?string
    {
        return $this->validated('idempotency_key');
    }
}
