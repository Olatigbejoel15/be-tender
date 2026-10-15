<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OrderIndexRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\AdminOrderResource;
use App\Services\AdminOrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private AdminOrderService $orders) {}

    // GET /api/v1/admin/orders?status=&search=&from=&to=&per_page=
    public function index(OrderIndexRequest $request): AnonymousResourceCollection
    {
        return AdminOrderResource::collection($this->orders->list($request->filters()));
    }

    // GET /api/v1/admin/orders/{reference}
    public function show(string $reference): AdminOrderResource
    {
        return new AdminOrderResource($this->orders->find($reference));
    }

    // PATCH /api/v1/admin/orders/{reference}/status
    public function updateStatus(UpdateOrderStatusRequest $request, string $reference): AdminOrderResource
    {
        return new AdminOrderResource(
            $this->orders->changeStatus($request->user(), $reference, $request->status(), $request->note())
        );
    }
}
