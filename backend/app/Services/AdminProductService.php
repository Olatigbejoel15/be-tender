<?php

namespace App\Services;

use App\DTOs\AdminProductFilterData;
use App\Enums\SizeLabel;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Services\Contracts\ImageUploaderInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Throwable;

class AdminProductService
{
    public function __construct(
        private ProductRepositoryInterface $products,
        private ImageUploaderInterface $uploader, // Cloudinary
        private AuditLogger $audit,
        private CatalogueCache $cache,            // Public catalogue cache
    ) {}

    public function list(AdminProductFilterData $filters): LengthAwarePaginator
    {
        return $this->products->paginateForAdmin($filters);
    }

    public function find(int $id): Product
    {
        return $this->products->findForAdmin($id) ?? throw (new ModelNotFoundException)->setModel(Product::class, [$id]); // 404
    }

    public function create(User $actor, array $data): Product
    {
        $data = [...$this->defaults(), ...$data];                              // Fill anything the form left out
        $this->assertSoldOutSizes($data['sizes'], $data['sold_out_sizes']);    // Sold-out sizes must exist

        return DB::transaction(function () use ($actor, $data) {               // Product + log saved together
            $product = $this->products->create([...$data, 'slug' => $this->uniqueSlug($data['name'])]);
            $this->audit->record($actor, 'product.created', 'product', $product->id, "Created {$product->name}");
            $this->refreshCatalogue();

            return $this->find($product->id);
        });
    }

    // Edit part of a product. $version is the version the admin was looking at.
    public function update(User $actor, int $id, array $data, int $version): Product
    {
        return DB::transaction(function () use ($actor, $id, $data, $version) {
            $product = $this->products->lockById($id)                           // Row locked from here
                ?? throw (new ModelNotFoundException)->setModel(Product::class, [$id]);

            if ($product->version !== $version) {                               // Someone saved in between
                throw new ConflictHttpException('Someone else changed this product while you were editing. Reload it and try again.'); // 409
            }

            $this->assertSoldOutSizes($data['sizes'] ?? $product->sizes, $data['sold_out_sizes'] ?? $product->sold_out_sizes ?? []);

            $changes = $this->audit->diff($product->only(array_keys($data)), $data); // What really changed

            if ($changes === []) {
                return $this->find($id);                                        // Nothing changed: no new version, no log
            }

            $this->products->update($product, $data);
            $this->audit->record($actor, 'product.updated', 'product', $id, "Updated {$product->name}", $changes);
            $this->refreshCatalogue();

            return $this->find($id);
        });
    }

    public function delete(User $actor, int $id): void
    {
        DB::transaction(function () use ($actor, $id) {
            $product = $this->find($id);
            $this->products->delete($product);                                  // Hidden, not erased (photos stay too)
            $this->audit->record($actor, 'product.deleted', 'product', $id, "Deleted {$product->name}");
            $this->refreshCatalogue();
        });
    }

    // Upload a colour photo (pass $color) or a gallery photo (leave $color null)
    public function addPhoto(User $actor, int $id, UploadedFile $file, ?string $color, ?int $position): Product
    {
        $product = $this->find($id);

        if ($color !== null) {
            $match = collect($product->colors)->first(fn ($c) => strcasecmp($c['name'], $color) === 0); // Case-insensitive
            if (! $match) {
                throw ValidationException::withMessages(['color' => ["{$product->name} has no colour called {$color}."]]);
            }
            $colorSlug = Str::slug($match['name']);                             // "Dark Blue" -> dark-blue
            $position  = 1;                                                     // One photo per colour
            $publicId  = "{$product->slug}-{$colorSlug}";                       // Same naming as your existing photos
        } else {
            $colorSlug = null;
            $position  = $position ?? $this->products->nextGalleryPosition($product);
            if ($position > 6) {
                throw ValidationException::withMessages(['photo' => ['The gallery is full (6 photos). Delete one first.']]);
            }
            $publicId = $position === 1 ? $product->slug : "{$product->slug}-{$position}";
        }

        $uploaded = $this->uploader->upload($file->getRealPath(), $publicId);  // Send to Cloudinary first

        DB::transaction(function () use ($actor, $product, $colorSlug, $position, $uploaded) {
            $this->products->savePhoto($product, $colorSlug, $position, $uploaded['public_id'], $uploaded['url']);
            $label = $colorSlug ? "{$colorSlug} photo" : "gallery photo #{$position}";
            $this->audit->record($actor, 'product.photo_added', 'product', $product->id, "Added {$label} to {$product->name}");
            $this->refreshCatalogue();
        });

        return $this->find($id);
    }

    public function removePhoto(User $actor, int $id, int $photoId): Product
    {
        $product = $this->find($id);
        $photo = $this->products->findPhoto($product, $photoId)
            ?? throw (new ModelNotFoundException)->setModel(Product::class, [$photoId]); // 404

        DB::transaction(function () use ($actor, $product, $photo) {
            $this->products->deletePhoto($photo);
            $this->audit->record($actor, 'product.photo_removed', 'product', $product->id, "Removed a photo from {$product->name}");
            $this->refreshCatalogue();
        });

        try {
            $this->uploader->delete($photo->public_id);                         // After the DB commit; a failure only leaves an orphan file
        } catch (Throwable $e) {
            Log::warning('Could not delete Cloudinary image', ['public_id' => $photo->public_id, 'error' => $e->getMessage()]);
        }

        return $this->find($id);
    }

    // Values used when the form leaves a field out on create
    private function defaults(): array
    {
        return [
            'badge' => null, 'size_label' => SizeLabel::Size->value, 'features' => [], 'sold_out_sizes' => [],
            'is_featured' => false, 'is_sold_out' => false, 'is_published' => true,
        ];
    }

    // "XL" can't be sold out if the product has no XL
    private function assertSoldOutSizes(array $sizes, array $soldOut): void
    {
        $unknown = array_diff($soldOut, $sizes);

        if ($unknown) {
            throw ValidationException::withMessages([
                'sold_out_sizes' => ['These sold-out sizes are not in the sizes list: ' . implode(', ', $unknown) . '.'],
            ]);
        }
    }

    // Name -> slug, adding -2, -3... if it is taken
    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while ($this->products->slugExists($slug)) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    // Clear the public cache, but only once the database change is really saved
    private function refreshCatalogue(): void
    {
        DB::afterCommit(fn () => $this->cache->flush());
    }
}
