<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdjustStockRequest;
use App\Http\Resources\AdminProductResource;
use App\Http\Resources\StockRowResource;
use App\Services\AdminStockService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StockController extends Controller
{
    public function __construct(private AdminStockService $stock) {}

    // GET /api/v1/admin/products/{id}/stock
    public function show(int $id): AdminProductResource
    {
        return new AdminProductResource($this->stock->show($id)); // Product with its stock rows
    }

    // PATCH /api/v1/admin/products/{id}/stock
    public function update(AdjustStockRequest $request, int $id): AdminProductResource
    {
        return new AdminProductResource($this->stock->adjust($request->user(), $id, $request->entries()));
    }

    // GET /api/v1/admin/stock/low
    public function low(): AnonymousResourceCollection
    {
        return StockRowResource::collection($this->stock->lowStock());
    }
}
