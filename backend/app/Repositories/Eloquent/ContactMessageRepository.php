<?php

namespace App\Repositories\Eloquent;

use App\DTOs\ContactMessageData;
use App\Models\ContactMessage;
use App\Repositories\Contracts\ContactMessageRepositoryInterface;

class ContactMessageRepository implements ContactMessageRepositoryInterface
{
    public function create(ContactMessageData $data): ContactMessage
    {
        return ContactMessage::create([
            'name'    => $data->name,
            'email'   => $data->email,
            'phone'   => $data->phone,
            'topic'   => $data->topic,
            'message' => $data->message,
        ]);
    }
}