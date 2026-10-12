<?php

namespace App\Services\Contracts;

interface ImageUploaderInterface
{
    // Uploads one local file and returns ['public_id' => ..., 'url' => ...]
    public function upload(string $path, string $publicId): array;
}
