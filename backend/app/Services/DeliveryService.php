<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class DeliveryService
{
    // Delivery fee in naira: 0 once the subtotal reaches the free-delivery limit
    public function fee(int $subtotal, string $state): int
    {
        $zoneFee = $this->zoneFee($state); // also rejects states we don't serve

        return $subtotal >= config('shop.free_delivery_over') ? 0 : $zoneFee;
    }

    // What the checkout page needs to show the fee before the customer pays
    public function quote(): array
    {
        $fees = [];
        foreach (config('shop.delivery_zones') as $zone) {
            foreach ($zone['states'] as $state) {
                $fees[$state] = $zone['fee']; // state name => its zone's fee
            }
        }

        return ['freeOver' => config('shop.free_delivery_over'), 'fees' => $fees];
    }

    // The fee of the zone this state belongs to
    private function zoneFee(string $state): int
    {
        $wanted = mb_strtolower(trim($state)); // "lagos " still matches Lagos

        foreach (config('shop.delivery_zones') as $zone) {
            foreach ($zone['states'] as $name) {
                if (mb_strtolower($name) === $wanted) {
                    return $zone['fee'];
                }
            }
        }

        throw ValidationException::withMessages(['state' => ["We don't deliver to that state yet."]]); // 422 on the state field
    }
}