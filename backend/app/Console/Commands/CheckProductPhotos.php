<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CheckProductPhotos extends Command
{
    protected $signature = 'catalogue:check {--path= : Folder that holds the photos}'; // php artisan catalogue:check
    protected $description = 'Compare product photos on disk with the products and colours in the database';

    private const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];   // allowed, lowercase only

    public function handle(): int
    {
        $dir = rtrim($this->option('path') ?: base_path('../frontend/public/products'), '/\\'); // where to look

        if (! is_dir($dir)) {
            $this->components->error("Folder not found: {$dir}");
            return self::FAILURE;
        }

        $have = collect(File::files($dir))->map(fn ($f) => $f->getFilename())->all(); // names on disk

        // base name (no extension) => full file name, only for allowed lowercase extensions
        $byBase = [];
        foreach ($have as $file) {
            if (in_array(pathinfo($file, PATHINFO_EXTENSION), self::EXTENSIONS, true)) {
                $byBase[pathinfo($file, PATHINFO_FILENAME)] = $file;
            }
        }

        $expected = [];      // every base name the catalogue can use
        $missingColor = [];  // colours with no photo
        $noPhoto = [];       // products that will show the placeholder
        $colorTotal = 0;

        foreach (Product::orderBy('id')->get() as $product) {
            $expected[] = $product->slug;                          // optional main photo
            $anyPhoto = isset($byBase[$product->slug]);            // main photo present?

            foreach ($product->colors as $color) {
                $base = $product->slug . '-' . Str::slug($color['name']);
                $expected[] = $base;
                $colorTotal++;
                if (isset($byBase[$base])) {
                    $anyPhoto = true;
                } else {
                    $missingColor[] = $base . '.png';
                }
            }

            if (! $anyPhoto) {
                $noPhoto[] = $product->slug;
            }
        }

        // Files that match nothing (gallery extras like name-2.png are allowed)
        $unknown = collect($have)->reject(function ($f) use ($expected, $byBase) {
            $base = pathinfo($f, PATHINFO_FILENAME);
            return $f === 'placeholder.svg'
                || (isset($byBase[$base]) && (in_array($base, $expected, true) || preg_match('/^[a-z0-9-]+-[2-6]$/', $base)));
        })->values();

        $found = $colorTotal - count($missingColor);
        $this->components->info(count($have) . " files found. Colour photos: {$found} of {$colorTotal}. The black photo is used as the main one.");

        if ($noPhoto) {
            $this->components->warn('Products with NO photo at all (will show the placeholder) (' . count($noPhoto) . '):');
            $this->components->bulletList($noPhoto);
        }
        if ($missingColor) {
            $this->components->warn('Missing COLOUR photos (' . count($missingColor) . '):');
            $this->components->bulletList($missingColor);
        }
        if ($unknown->isNotEmpty()) {
            $this->components->error('Files with a wrong name (' . $unknown->count() . '):');
            $this->components->bulletList($unknown->map(fn ($f) => $this->describe($f, $expected))->all());
        }

        if (! $missingColor && ! $noPhoto && $unknown->isEmpty()) {
            $this->components->info('Perfect: every photo is named correctly.');
            return self::SUCCESS;
        }

        return self::FAILURE;
    }

    // Explains what is wrong with a file name and suggests the closest right name
    private function describe(string $file, array $expected): string
    {
        $lower = strtolower($file);
        $lowerBase = strtolower(pathinfo($file, PATHINFO_FILENAME));

        foreach ($expected as $base) {
            if ($lowerBase === $base) {                      // right name, wrong capitals or extension
                return "{$file}  ->  use lowercase and an allowed extension: {$base}.png";
            }
        }

        $best = null;
        $bestScore = 99;
        foreach ($expected as $base) {
            $score = levenshtein($lowerBase, $base);         // how many characters differ
            if ($score < $bestScore) {
                $best = $base;
                $bestScore = $score;
            }
        }

        return $bestScore <= 4 ? "{$file}  ->  did you mean {$best}.png?" : "{$file}  ->  no matching product";
    }
}
