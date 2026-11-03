<?php

namespace App\DTOs;

final readonly class NewsletterSignupData
{
    public function __construct(
        public string $email,            // Lowercased
        public ?string $honeypot = null, // Hidden field: only bots fill it in
    ) {}
}