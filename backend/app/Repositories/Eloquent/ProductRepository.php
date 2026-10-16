<?php

namespace App\Repositories\Eloquent;

use App\DTOs\ProductFilterData;
use App\Enums\ProductSort;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use App\DTOs\AdminProductFilterData;
use App\Models\ProductPhoto;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function getFiltered(ProductFilterData $filters): Collection
    {
            return Product::query()
            ->where('is_published', true)   // Drafts never appear on the public site
            ->with(['category', 'photos'])                                              // load categories and photos in one query
            ->when($filters->category, fn ($q, $slug) =>                    // runs only if a category was given
                $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->when($filters->featured, fn ($q) =>                           // featured only
                $q->where('is_featured', true))
            ->when($filters->search, fn ($q, $term) =>                      // name or description match
                $q->where(fn ($w) => $w
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")))
            ->when($filters->sort === ProductSort::PriceAsc, fn ($q) => $q->orderBy('price'))
            ->when($filters->sort === ProductSort::PriceDesc, fn ($q) => $q->orderByDesc('price'))
            ->orderBy('id')                                                 // default order / tie-breaker
            ->get();
    }

    public function findBySlug(string $slug): ?Product
    {
        return Product::with('category', 'photos')->where('slug', $slug)->where('is_published', true)->first();

    }
    public function findManyByIds(array $ids): \Illuminate\Support\Collection
    {
        return Product::with('photos')->whereIn('id', $ids)->get()->keyBy('id'); // id => product
    }

        public function paginateForAdmin(AdminProductFilterData $filters): LengthAwarePaginator
    {
        return Product::with(['category', 'photos'])
            ->when($filters->search, fn ($q, $term) => $q->where('name', 'like', "%{$term}%"))
            ->when($filters->category, fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->when($filters->published !== null, fn ($q) => $q->where('is_published', $filters->published)) // Drafts or live
            ->when($filters->soldOut !== null, fn ($q) => $q->where('is_sold_out', $filters->soldOut))
            ->latest('id')
            ->paginate($filters->perPage);
    }

    public function findForAdmin(int $id): ?Product
    {
        return Product::with(['category', 'photos'])->find($id); // Soft-deleted ones are skipped automatically
    }

    public function lockById(int $id): ?Product
    {
        return Product::whereKey($id)->lockForUpdate()->first(); // Others wait until our transaction ends
    }

    public function slugExists(string $slug): bool
    {
        return Product::withTrashed()->where('slug', $slug)->exists();
    }

    public function create(array $attributes): Product
    {
        $product = new Product();
        $product->forceFill($attributes)->save(); // Input is already validated, so we bypass $fillable

        return $product;
    }

    public function update(Product $product, array $attributes): Product
    {
        $product->forceFill($attributes);
        $product->version = $product->version + 1; // Every edit bumps the version
        $product->save();

        return $product;
    }

    public function delete(Product $product): void
    {
        $product->delete(); // Soft delete (sets deleted_at)
    }

    public function nextGalleryPosition(Product $product): int
    {
        return (int) ProductPhoto::where('product_id', $product->id)->whereNull('color')->max('position') + 1;
    }

    public function savePhoto(Product $product, ?string $color, int $position, string $publicId, string $url): ProductPhoto
    {
        return ProductPhoto::updateOrCreate(                                   // Replaces the photo in that slot, if any
            ['product_id' => $product->id, 'color' => $color, 'position' => $position],
            ['public_id' => $publicId, 'url' => $url]
        );
    }

    public function findPhoto(Product $product, int $photoId): ?ProductPhoto
    {
        return ProductPhoto::where('product_id', $product->id)->find($photoId); // Only this product's photos
    }

    public function deletePhoto(ProductPhoto $photo): void
    {
        $photo->delete();
    }
}
