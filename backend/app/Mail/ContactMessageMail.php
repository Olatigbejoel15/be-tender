<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contact) {}

    public function envelope(): Envelope
    {
        $topic = str_replace(["\r", "\n"], ' ', $this->contact->topic); // no line breaks in a subject

        return new Envelope(
            replyTo: [new Address($this->contact->email, $this->contact->name)], // Reply goes to the customer
            subject: "New message: {$topic}",
        );
    }

    public function content(): Content
    {
        $c = $this->contact;
        $body = "From: {$c->name} <{$c->email}>\nPhone: " . ($c->phone ?? '-') . "\nTopic: {$c->topic}\n\n{$c->message}";

        return new Content(htmlString: nl2br(e($body))); // escaped, so nothing a visitor types can inject HTML
    }
}