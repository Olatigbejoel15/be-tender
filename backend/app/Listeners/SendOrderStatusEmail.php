<?php

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderStatusChanged;
use App\Mail\OrderUpdateMail;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusEmail
{
    public function handle(OrderStatusChanged $event): void
    {
        $order = $event->order->loadMissing('items');

        $copy = match ($event->to) {                                // Only these changes email the customer
            OrderStatus::Shipped   => ['Your order is on its way', 'Your order has shipped. It should reach you soon.'],
            OrderStatus::Delivered => ['Your order was delivered', 'Your order has been delivered. We hope you love it.'],
            OrderStatus::Cancelled => ['Your order was cancelled', 'This order has been cancelled. If you did not complete payment, you have not been charged.'],
            default                => null,
        };

        if ($copy === null || ! $order->email) {
            return;
        }

        Mail::to($order->email)->send(new OrderUpdateMail(
            $order, "{$copy[0]} ({$order->reference})", $copy[0], $copy[1],
        ));
    }
}
