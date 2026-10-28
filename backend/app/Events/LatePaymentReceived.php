<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LatePaymentReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(public Order $order) {} // The cancelled order that was paid
}