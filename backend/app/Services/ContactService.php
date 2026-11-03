<?php

namespace App\Services;

use App\DTOs\ContactMessageData;
use App\Mail\ContactMessageMail;
use App\Repositories\Contracts\ContactMessageRepositoryInterface;
use Illuminate\Support\Facades\Mail;

class ContactService
{
    public function __construct(private ContactMessageRepositoryInterface $messages) {}

    // Saves the message and tells the team
    public function submit(ContactMessageData $data): void
    {
        if ($data->honeypot) {
            return; // hidden field filled = a bot: pretend it worked, save nothing
        }

        $message = $this->messages->create($data);

        if ($to = config('shop.staff_alert_email')) {
            Mail::to($to)->send(new ContactMessageMail($message)); // queued; the message is already safe in the database
        }
    }
}