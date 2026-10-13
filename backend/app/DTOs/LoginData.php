<?php

namespace App\DTOs;

final readonly class LoginData
{
    public function __construct(
        public string $email,    // Lowercased login email
        public string $password, // Plain text, checked against the hash
    ) {}
}
