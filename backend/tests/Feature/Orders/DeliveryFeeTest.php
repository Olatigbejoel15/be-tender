<?php

namespace Tests\Feature\Orders;

use App\Services\DeliveryService;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class DeliveryFeeTest extends TestCase
{
    private function delivery(): DeliveryService
    {
        config(['shop.free_delivery_over' => 100000]); // fixed so the test doesn't depend on your real limit
        return app(DeliveryService::class);
    }

    public function test_every_nigerian_state_is_in_exactly_one_zone(): void
    {
        $states = collect(config('shop.delivery_zones'))->pluck('states')->flatten();

        $this->assertCount(37, $states);          // 36 states + FCT
        $this->assertCount(37, $states->unique()); // none listed twice
    }

    public function test_fee_follows_the_zone(): void
    {
        $zones = collect(config('shop.delivery_zones'));
        $fee = fn (string $zone) => $zones->firstWhere('name', $zone)['fee'];

        $this->assertSame($fee('Lagos'), $this->delivery()->fee(20000, 'Lagos'));
        $this->assertSame($fee('Nearby'), $this->delivery()->fee(20000, 'Ogun'));
        $this->assertSame($fee('North'), $this->delivery()->fee(20000, 'Kano'));
    }

    public function test_state_matching_ignores_case_and_spaces(): void
    {
        $this->assertSame($this->delivery()->fee(20000, 'Lagos'), $this->delivery()->fee(20000, '  lagos '));
    }

    public function test_delivery_is_free_at_the_limit(): void
    {
        $this->assertSame(0, $this->delivery()->fee(100000, 'Kano')); // exactly the limit
        $this->assertGreaterThan(0, $this->delivery()->fee(99999, 'Kano')); // one naira short
    }

    public function test_an_unknown_state_is_rejected_even_when_delivery_would_be_free(): void
    {
        $this->expectException(ValidationException::class);

        $this->delivery()->fee(500000, 'Atlantis');
    }

    public function test_the_fees_endpoint_lists_every_state_and_the_free_limit(): void
    {
        config(['shop.free_delivery_over' => 120000]);

        $this->getJson('/api/v1/delivery-fees')
            ->assertOk()
            ->assertJsonPath('freeOver', 120000)
            ->assertJsonPath('fees.Lagos', collect(config('shop.delivery_zones'))->firstWhere('name', 'Lagos')['fee'])
            ->assertJsonCount(37, 'fees');
    }
}