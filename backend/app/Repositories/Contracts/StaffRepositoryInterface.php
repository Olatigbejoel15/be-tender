<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface StaffRepositoryInterface
{
    public function list(): Collection;                              // Admins and super admins

    public function findByEmail(string $email): ?User;               // Any user, for the promote-a-customer path

    public function create(array $attributes): User;                 // New staff account

    public function update(User $user, array $attributes): void;     // Role / active flag (not mass-assignable, so forced)

    public function lockActiveSuperAdmins(): Collection;             // Lock the super-admin rows (always first, same order)

    public function lockStaffById(int $id): ?User;                   // Lock one staff row

    public function revokeTokens(User $user): void;                  // Log them out everywhere
}
