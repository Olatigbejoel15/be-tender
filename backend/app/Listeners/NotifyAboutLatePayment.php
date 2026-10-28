<?php

namespace App\Listeners;

use App\Events\LatePaymentReceived;
use App\Mail\OrderUpdateMail;
use Illuminate\Support\Facades\Mail;

class NotifyAboutLatePayment
{
    public function handle(LatePaymentReceived $event): void
    {
        $order = $event->order->loadMissing('items');

        if ($order->email) {                                            // Tell the customer, so they are not left wondering
            Mail::to($order->email)->send(new OrderUpdateMail(
                $order,
                "About your payment for {$order->reference}",
                'Your payment arrived after the order expired',
                "Hi {$order->recipient_name}, your payment reached us after this order was cancelled and its items were released. "
                . "We are arranging a full refund and will email you once it is done.",
            ));
        }

        if ($staff = config('shop.staff_alert_email')) {                // Tell the team what to do
            Mail::to($staff)->send(new OrderUpdateMail(
                $order,
                "REFUND NEEDED: {$order->reference}",
                'Refund needed',
                "{$order->recipient_name} paid NGN " . number_format($order->total) . " after the order was cancelled. "
                . "Refund payment {$order->payment_reference} in the Paystack dashboard.",
                forStaff: true,
            ));
        }
    }
}