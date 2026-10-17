<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderUpdateMail extends Mailable implements ShouldQueue // ShouldQueue = sent by the worker
{
    use Queueable, SerializesModels;

    public int $tries = 3;                 // Attempts before it counts as failed
    public array $backoff = [30, 120];     // Seconds to wait between attempts

    public function __construct(
        public Order $order,
        public string $mailSubject,
        public string $headline,
        public string $intro,
        public bool $forStaff = false,     // Hides the customer's "view order" button
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->mailSubject);
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.order-update');
    }
}
