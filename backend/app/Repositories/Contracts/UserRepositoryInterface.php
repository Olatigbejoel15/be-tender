<?php

namespace App\Repositories\Contracts;

use App\DTOs\RegisterData;
use App\Models\User;

interface UserRepositoryInterface
{
    public function create(RegisterData $data): User;   // Save a new customer

    public function findByEmail(string $email): ?User;  // Look up by email, or null
}
