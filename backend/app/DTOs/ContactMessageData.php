<?php

namespace App\DTOs;

final readonly class ContactMessageData
{
    public function __construct(
        public string $name,
        public string $email,         // Lowercased
        public ?string $phone,        // Optional
        public string $topic,
        public string $message,
        public ?string $honeypot = null, // Hidden field: only bots fill it in
    ) {}
}