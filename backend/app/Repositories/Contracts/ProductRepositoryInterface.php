<?php

namespace App\Repositories\Contracts;

use App\DTOs\ProductFilterData;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use App\DTOs\AdminProductFilterData;
use App\Models\ProductPhoto;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function getFiltered(ProductFilterData $filters): Collection;   // filtered, sorted list
    // Several products at once, keyed by id, with photos loaded
    public function findManyByIds(array $ids): \Illuminate\Support\Collection;
    
    public function findBySlug(string $slug): ?Product;                    // one product or null

    public function paginateForAdmin(AdminProductFilterData $filters): LengthAwarePaginator; // Staff list, drafts included

    public function findForAdmin(int $id): ?Product;                    // One product with category + photos

    public function lockById(int $id): ?Product;                        // Fetch AND lock (use inside a transaction)

    public function slugExists(string $slug): bool;                     // Includes deleted products (slugs stay reserved)

    public function create(array $attributes): Product;                 // Insert

    public function update(Product $product, array $attributes): Product; // Save + bump version

    public function delete(Product $product): void;                     // Soft delete

    public function nextGalleryPosition(Product $product): int;         // Next free gallery slot

    public function savePhoto(Product $product, ?string $color, int $position, string $publicId, string $url): ProductPhoto;

    public function findPhoto(Product $product, int $photoId): ?ProductPhoto;

    public function deletePhoto(ProductPhoto $photo): void;
}
