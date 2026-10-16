<?php

namespace App\Services;

use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CatalogueCache
{
    // Return the cached value, or run $callback, store its result and return it
    public function remember(string $key, Closure $callback): mixed
    {
        $ttl = (int) config('shop.catalogue_cache_ttl');

        if ($ttl <= 0) {
            return $callback(); // Caching switched off (handy while debugging)
        }

        return Cache::remember("catalogue:{$this->version()}:{$key}", $ttl, $callback);
    }

    // Admin changed something: a new version makes every old entry unreachable
    public function flush(): void
    {
        Cache::forever('catalogue:version', (string) Str::uuid());
    }

    // The current version token (created on first use)
    private function version(): string
    {
        return Cache::rememberForever('catalogue:version', fn () => (string) Str::uuid());
    }
}
