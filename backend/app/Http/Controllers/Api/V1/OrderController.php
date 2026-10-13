<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private OrderService $orders) {}

    // POST /api/v1/orders (place an order)
    public function store(CheckoutRequest $request): JsonResponse
    {
        $order = $this->orders->place($request->user(), $request->toData());

        return (new OrderResource($order))->response()->setStatusCode(201); // 201 = created
    }

    // GET /api/v1/orders (my orders)
    public function index(Request $request): AnonymousResourceCollection
    {
        return OrderResource::collection($this->orders->listFor($request->user()));
    }

    // GET /api/v1/orders/{reference} (one of my orders)
    public function show(Request $request, string $reference): OrderResource
    {
        return new OrderResource($this->orders->findFor($request->user(), $reference));
    }
}
