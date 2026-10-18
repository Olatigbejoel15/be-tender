<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(private ProductService $products) {}

    // GET /api/v1/products  ->  { "data": [ ... ] }  (same shape as before)
    public function index(ProductIndexRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->products->list($request->toFilters())]);
    }

    // GET /api/v1/products/{slug}  ->  { "data": { ... } }
    public function show(string $slug): JsonResponse
    {
        return response()->json(['data' => $this->products->findBySlug($slug)]);
    }
}
