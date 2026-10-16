<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public const UPDATED_AT = null; // Only created_at exists

    protected $fillable = ['user_id', 'action', 'subject_type', 'subject_id', 'summary', 'changes', 'ip_address'];

    protected function casts(): array
    {
        return ['changes' => 'array']; // JSON column <-> PHP array
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class); // The staff member who acted
    }
}
