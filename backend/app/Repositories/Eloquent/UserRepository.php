<?php

namespace App\Repositories\Eloquent;

use App\DTOs\RegisterData;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
        public function create(RegisterData $data): User
    {
        return User::create([
            'name'     => $data->name,
            'email'    => $data->email,
            'phone'    => $data->phone,
            'password' => $data->password, // "hashed" cast on the model hashes it
        ])->refresh(); // Loads DB defaults (role = customer, is_active = true) into the model
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first(); // null if no match
    }
}
