<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\StaffRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StaffRepository implements StaffRepositoryInterface
{
    private const STAFF_ROLES = ['admin', 'super_admin'];

    public function list(): Collection
    {
        return User::whereIn('role', self::STAFF_ROLES)->orderBy('name')->get();
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $attributes): User
    {
        $user = new User();
        $user->forceFill($attributes)->save(); // forceFill: "role" is deliberately not in $fillable

        return $user;
    }

    public function update(User $user, array $attributes): void
    {
        $user->forceFill($attributes)->save();
    }

    public function lockActiveSuperAdmins(): Collection
    {
        return User::where('role', 'super_admin')->where('is_active', true)
            ->orderBy('id')->lockForUpdate()->get(); // Fixed order = no deadlocks
    }

    public function lockStaffById(int $id): ?User
    {
        return User::whereIn('role', self::STAFF_ROLES)->whereKey($id)->lockForUpdate()->first();
    }

    public function revokeTokens(User $user): void
    {
        $user->tokens()->delete(); // Sanctum tokens: they stop working at once
    }
}
