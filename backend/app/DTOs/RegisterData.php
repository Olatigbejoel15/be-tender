<?php

namespace App\DTOs;

final readonly class RegisterData
{
    public function __construct(
        public string $name,      // Full name
        public string $email,     // Lowercased login email
        public string $password,  // Plain text; the model hashes it on save
        public ?string $phone = null, // Optional, for delivery contact
    ) {}
}
