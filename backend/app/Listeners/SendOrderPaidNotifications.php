<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Mail\OrderUpdateMail;
use Illuminate\Support\Facades\Mail;

class SendOrderPaidNotifications
{
    public function handle(OrderPaid $event): void
    {
        $order = $event->order->loadMissing('user', 'items');

        if ($order->user) {
            Mail::to($order->user->email)->send(new OrderUpdateMail(
                $order,
                "Payment received for {$order->reference}",
                'Payment received',
                "Thanks, {$order->recipient_name}. We have your payment and we're getting your order ready. We'll email you when it ships.",
            ));
        }

        if ($staff = config('shop.staff_alert_email')) {           // Optional alert for the team
            Mail::to($staff)->send(new OrderUpdateMail(
                $order,
                "New paid order {$order->reference}",
                'New paid order',
                "{$order->recipient_name} ({$order->state}) paid ₦" . number_format($order->total) . '.',
                forStaff: true,
            ));
        }
    }
}
