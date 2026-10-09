<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;

class ProductController extends Controller
{
    public function __construct(private ProductService $products) {}

    // GET /api/v1/products
    public function index(ProductIndexRequest $request)
    {
        return ProductResource::collection($this->products->list($request->toFilters()));
    }

    // GET /api/v1/products/{slug}
    public function show(string $slug)
    {
        return new ProductResource($this->products->findBySlug($slug));
    }
}
