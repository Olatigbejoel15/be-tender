<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class AuditLogger
{
    // Write one log entry
    public function record(User $actor, string $action, string $subjectType, int $subjectId, string $summary, array $changes = []): void
    {
        AuditLog::create([
            'user_id'      => $actor->id,
            'action'       => $action,
            'subject_type' => $subjectType,
            'subject_id'   => $subjectId,
            'summary'      => $summary,
            'changes'      => $changes ?: null, // Store null instead of an empty list
            'ip_address'   => request()->ip(),
        ]);
    }

    // Compare before/after and keep only the fields that really changed
    public function diff(array $before, array $after): array
    {
        $changes = [];

        foreach ($after as $key => $value) {
            $old = $before[$key] ?? null;

            if (json_encode($old) !== json_encode($value)) { // JSON compare handles arrays and enums
                $changes[$key] = ['from' => $old, 'to' => $value];
            }
        }

        return $changes;
    }

    // Newest first, with optional filters (used by the super admin log screen)
    public function list(?string $action, ?string $subjectType, int $perPage = 30): LengthAwarePaginator
    {
        return AuditLog::with('user')
            ->when($action, fn ($q, $a) => $q->where('action', $a))
            ->when($subjectType, fn ($q, $t) => $q->where('subject_type', $t))
            ->latest('id')
            ->paginate($perPage);
    }
}
