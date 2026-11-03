<?php

namespace App\Http\Requests;

use App\DTOs\DeliveryUpdateData;

class UpdateOrderDeliveryRequest extends OrderAccessRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [ // parent = the email proof guests need
            'recipient_name' => ['required', 'string', 'max:100'],
            'phone'          => ['required', 'string', 'max:20'],
            'address'        => ['required', 'string', 'max:255'],
            'city'           => ['required', 'string', 'max:100'],
            'state'          => ['required', 'string', 'max:100'],
        ]);
    }

    // The validated input as a typed object
    public function delivery(): DeliveryUpdateData
    {
        return new DeliveryUpdateData(
            recipientName: trim($this->validated('recipient_name')),
            phone: trim($this->validated('phone')),
            address: trim($this->validated('address')),
            city: trim($this->validated('city')),
            state: trim($this->validated('state')),
        );
    }
}