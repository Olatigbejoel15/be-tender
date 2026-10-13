<?php

namespace App\Services;

use App\DTOs\LoginData;
use App\DTOs\RegisterData;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private UserRepositoryInterface $users) {} // Injected by the container

    // Create the account and log it in straight away
    public function register(RegisterData $data): array
    {
        $user = $this->users->create($data);

        return ['user' => $user, 'token' => $this->issueToken($user)];
    }

    // Check the credentials and hand back a fresh token
    public function login(LoginData $data): array
    {
        $user = $this->users->findByEmail($data->email);

        if (! $user || ! Hash::check($data->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'], // Same message for both cases
            ]);
        }

        return ['user' => $user, 'token' => $this->issueToken($user)];
    }

    // Revoke only the token used for this request (other devices stay logged in)
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    private function issueToken(User $user): string
    {
        return $user->createToken('web')->plainTextToken; // The raw token is shown only once
    }
}
