<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductPhoto;
use App\Services\Contracts\ImageUploaderInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Throwable;

class UploadProductImages extends Command
{
    protected $signature = 'images:upload {--only= : One product slug} {--force : Re-upload photos already uploaded}';

    protected $description = 'Upload product photos from frontend/public/products to Cloudinary';

    public function handle(ImageUploaderInterface $uploader): int
    {
        $dir = base_path('../frontend/public/products');            // Where the photos live
        $files = [];                                                // base name => full path
        foreach (glob($dir . '/*.{png,jpg,jpeg,webp}', GLOB_BRACE) as $path) {
            $files[pathinfo($path, PATHINFO_FILENAME)] = $path;     // "core-leggings-black" => path
        }

        $products = Product::with('photos')                         // Load existing photo rows once
            ->when($this->option('only'), fn ($q, $slug) => $q->where('slug', $slug))
            ->get();

        $uploaded = $skipped = $failed = 0;                         // Counters for the summary

        foreach ($products as $product) {
            $done = $product->photos                                // Keys of photos already in the DB
                ->map(fn ($p) => ($p->color ?? '') . '|' . $p->position)->all();

            $wanted = [];                                           // [file base, color slug|null, position]
            foreach ($product->colors ?? [] as $color) {
                $colorSlug = Str::slug($color['name']);             // "Dark Blue" => "dark-blue"
                $wanted[] = [$product->slug . '-' . $colorSlug, $colorSlug, 1];
            }
            $wanted[] = [$product->slug, null, 1];                  // Optional main photo
            foreach (range(2, 6) as $n) {
                $wanted[] = [$product->slug . '-' . $n, null, $n];  // Optional gallery photos
            }

            foreach ($wanted as [$base, $color, $position]) {
                if (! isset($files[$base])) {
                    continue;                                       // No such photo, nothing to upload
                }
                if (in_array(($color ?? '') . '|' . $position, $done, true) && ! $this->option('force')) {
                    $skipped++;                                     // Already uploaded earlier
                    continue;
                }

                try {
                    $result = $uploader->upload($files[$base], $base); // Send to Cloudinary
                    ProductPhoto::updateOrCreate(
                        ['product_id' => $product->id, 'color' => $color, 'position' => $position],
                        ['public_id' => $result['public_id'], 'url' => $result['url']]
                    );
                    $uploaded++;
                    $this->line("uploaded  {$base}");
                } catch (Throwable $e) {
                    $failed++;                                      // Keep going, report at the end
                    $this->error("FAILED    {$base}: {$e->getMessage()}");
                }
            }
        }

        $this->info("Done. Uploaded {$uploaded}, skipped {$skipped}, failed {$failed}.");

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
