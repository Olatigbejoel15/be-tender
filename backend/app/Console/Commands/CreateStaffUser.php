<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateStaffUser extends Command
{
    protected $signature = 'staff:create {--role=super_admin : super_admin or admin}'; // php artisan staff:create

    protected $description = 'Create an admin or super admin account from the command line';

    public function handle(): int
    {
        $role = UserRole::tryFrom((string) $this->option('role'));

        if (! $role || ! $role->isStaff()) {
            $this->error('Role must be super_admin or admin.');
            return self::FAILURE;
        }

        $name     = $this->ask('Full name');
        $email    = $this->ask('Email');
        $password = $this->secret('Password (min 12 characters, hidden as you type)');

        $validator = Validator::make(compact('name', 'email', 'password'), [
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'unique:users,email'], // Must not exist already
            'password' => ['required', 'string', 'min:12'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }
            return self::FAILURE;
        }

        $user = User::create(compact('name', 'email', 'password')); // Password is hashed by the model cast

        // role is not mass-assignable on purpose, so we set it here with forceFill
        $user->forceFill(['role' => $role, 'is_active' => true])->save();

        $this->info("{$role->label()} created: {$email}");

        return self::SUCCESS;
    }
}
