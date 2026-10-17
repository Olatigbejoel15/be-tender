<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Services\StaffService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StaffController extends Controller
{
    public function __construct(private StaffService $staff) {}

    // GET /api/v1/admin/staff
    public function index(): AnonymousResourceCollection
    {
        return StaffResource::collection($this->staff->list());
    }

    // POST /api/v1/admin/staff
    public function store(StoreStaffRequest $request): JsonResponse
    {
        $user = $this->staff->create($request->user(), $request->validated());

        return (new StaffResource($user))->response()
            ->setStatusCode($user->wasRecentlyCreated ? 201 : 200); // 201 = new account, 200 = customer promoted
    }

    // PATCH /api/v1/admin/staff/{id}
    public function update(UpdateStaffRequest $request, int $id): StaffResource
    {
        return new StaffResource($this->staff->update($request->user(), $id, $request->changes()));
    }
}
