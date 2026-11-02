<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    // Sends the link if the account exists. The result is ignored on purpose,
    // so the response is identical for known and unknown emails.
    public function sendLink(string $email): void
    {
        Password::sendResetLink(['email' => $email]);
    }

    // Sets the new password if the token is valid, otherwise throws a 422
    public function reset(array $data): void
    {
        $status = Password::reset(
            [
                'email' => $data['email'],
                'password' => $data['password'],
                'token' => $data['token'],
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password), // store the new hash
                    'remember_token' => Str::random(60), // rotate the remember token
                ])->save();

                $user->tokens()->delete(); // sign out every device that used the old password
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['This password reset link is invalid or has expired.'], // one message for every failure
            ]);
        }
    }
}