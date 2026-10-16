<?php

namespace App\Services\Contracts;

interface ImageUploaderInterface
{
    // Uploads one local file and returns ['public_id' => ..., 'url' => ...]
    public function upload(string $path, string $publicId): array;

    // Removes an image from the storage service by its public id
    public function delete(string $publicId): void;
}
