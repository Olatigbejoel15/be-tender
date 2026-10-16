<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductIndexRequest;
use App\Http\Requests\Admin\ProductWriteRequest;
use App\Http\Requests\Admin\StoreProductPhotoRequest;
use App\Http\Resources\AdminProductResource;
use App\Services\AdminProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(private AdminProductService $products) {}

    // GET /api/v1/admin/products
    public function index(ProductIndexRequest $request): AnonymousResourceCollection
    {
        return AdminProductResource::collection($this->products->list($request->filters()));
    }

    // GET /api/v1/admin/products/{id}
    public function show(int $id): AdminProductResource
    {
        return new AdminProductResource($this->products->find($id));
    }

    // POST /api/v1/admin/products
    public function store(ProductWriteRequest $request): JsonResponse
    {
        $product = $this->products->create($request->user(), $request->payload());

        return (new AdminProductResource($product))->response()->setStatusCode(201); // 201 = created
    }

    // PATCH /api/v1/admin/products/{id}
    public function update(ProductWriteRequest $request, int $id): AdminProductResource
    {
        return new AdminProductResource(
            $this->products->update($request->user(), $id, $request->payload(), $request->version())
        );
    }

    // DELETE /api/v1/admin/products/{id}
    public function destroy(Request $request, int $id): Response
    {
        $this->products->delete($request->user(), $id);

        return response()->noContent(); // 204 = done, nothing to return
    }

    // POST /api/v1/admin/products/{id}/photos (multipart form)
    public function storePhoto(StoreProductPhotoRequest $request, int $id): AdminProductResource
    {
        return new AdminProductResource($this->products->addPhoto(
            $request->user(), $id, $request->file('photo'), $request->validated('color'), $request->validated('position')
        ));
    }

    // DELETE /api/v1/admin/products/{id}/photos/{photoId}
    public function destroyPhoto(Request $request, int $id, int $photoId): AdminProductResource
    {
        return new AdminProductResource($this->products->removePhoto($request->user(), $id, $photoId));
    }
}
