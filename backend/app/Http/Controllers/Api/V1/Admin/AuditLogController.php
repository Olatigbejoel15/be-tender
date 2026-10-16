<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuditLogController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    // GET /api/v1/admin/audit-logs?action=&subject_type= (super admin only, enforced in the route)
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['action' => ['nullable', 'string', 'max:50'], 'subject_type' => ['nullable', 'string', 'max:50']]);

        return AuditLogResource::collection(
            $this->audit->list($request->query('action'), $request->query('subject_type'))
        );
    }
}
