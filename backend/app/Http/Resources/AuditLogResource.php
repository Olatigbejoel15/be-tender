<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'action'      => $this->action,
            'summary'     => $this->summary,
            'changes'     => $this->changes,                         // {field: {from, to}}
            'by'          => $this->user?->name ?? 'System',
            'subjectType' => $this->subject_type,
            'subjectId'   => $this->subject_id,
            'ip'          => $this->ip_address,
            'createdAt'   => $this->created_at?->toIso8601String(),
        ];
    }
}
