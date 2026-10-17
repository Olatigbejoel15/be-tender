<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use App\Repositories\Contracts\StaffRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StaffService
{
    public function __construct(
        private StaffRepositoryInterface $staff,
        private AuditLogger $audit,
    ) {}

    public function list(): Collection
    {
        return $this->staff->list();
    }

    // New staff account, or promote an existing customer who has this email
    public function create(User $actor, array $data): User
    {
        $role = UserRole::from($data['role']);

        return DB::transaction(function () use ($actor, $data, $role) {
            $existing = $this->staff->findByEmail($data['email']);

            if ($existing) {
                if ($existing->role !== UserRole::Customer) {
                    throw ValidationException::withMessages(['email' => ['This person is already on the staff.']]);
                }

                $this->staff->update($existing, ['role' => $role, 'is_active' => true]); // Customer -> staff
                $this->audit->record($actor, 'staff.promoted', 'user', $existing->id, "Promoted {$existing->email} to {$role->value}");

                return $existing->refresh();
            }

            if (empty($data['name']) || empty($data['password'])) {                      // Brand-new account needs both
                throw ValidationException::withMessages(['name' => ['Name and password are required for a new staff account.']]);
            }

            $user = $this->staff->create([
                'name'      => $data['name'],
                'email'     => $data['email'],
                'password'  => Hash::make($data['password']),
                'role'      => $role,
                'is_active' => true,
            ]);

            $this->audit->record($actor, 'staff.created', 'user', $user->id, "Created {$role->value} {$user->email}");

            return $user;
        });
    }

    // Change role and/or active status
    public function update(User $actor, int $id, array $changes): User
    {
        return DB::transaction(function () use ($actor, $id, $changes) {
            $superAdmins = $this->staff->lockActiveSuperAdmins();                       // Always lock these first
            $user = $this->staff->lockStaffById($id)
                ?? throw (new ModelNotFoundException)->setModel(User::class, [$id]);    // 404 (also for customers)

            if ($user->is($actor)) {
                throw ValidationException::withMessages(['user' => ['You cannot change your own role or status.']]);
            }

            $newRole   = isset($changes['role']) ? UserRole::from($changes['role']) : $user->role;
            $newActive = $changes['is_active'] ?? (bool) $user->is_active;

            // Would this change remove an active super admin from the pool?
            $losesSuper = $user->role === UserRole::SuperAdmin && $user->is_active
                && ($newRole !== UserRole::SuperAdmin || ! $newActive);

            if ($losesSuper && $superAdmins->reject(fn ($u) => $u->id === $user->id)->isEmpty()) {
                throw ValidationException::withMessages(['user' => ['There must always be at least one active super admin.']]);
            }

            $before = ['role' => $user->role->value, 'is_active' => (bool) $user->is_active];
            $after  = ['role' => $newRole->value,    'is_active' => (bool) $newActive];
            $diff   = $this->audit->diff($before, $after);

            if ($diff === []) {
                return $user;                                                           // Nothing changed
            }

            $this->staff->update($user, ['role' => $newRole, 'is_active' => $newActive]);

            if (! $newActive) {
                $this->staff->revokeTokens($user);                                      // Deactivated = logged out now
            }

            $this->audit->record($actor, 'staff.updated', 'user', $user->id, "Updated {$user->email}", $diff);

            return $user->refresh();
        }, 3); // Retry if MySQL reports a deadlock
    }
}
