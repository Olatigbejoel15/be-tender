<?php

namespace App\Services\Images;

use App\Services\Contracts\ImageUploaderInterface;
use Cloudinary\Cloudinary;
use RuntimeException;
use Throwable;

class CloudinaryImageUploader implements ImageUploaderInterface
{
    private Cloudinary $client; // SDK client, built once per instance

    public function __construct()
    {
        $this->client = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'), // Which account
                'api_key'    => config('cloudinary.api_key'),    // Who we are
                'api_secret' => config('cloudinary.api_secret'), // Proof
            ],
            'url' => ['secure' => true], // Always return https URLs
        ]);
    }

    public function upload(string $path, string $publicId): array
    {
        if (! is_file($path)) {
            throw new RuntimeException("Image not found: {$path}"); // Fail early on a bad path
        }

        try {
            $result = $this->client->uploadApi()->upload($path, [
                'public_id'     => $publicId,                    // File name inside Cloudinary
                'folder'        => config('cloudinary.folder'),  // Keeps products together
                'overwrite'     => true,                         // Re-running replaces, no duplicates
                'resource_type' => 'image',
            ]);
        } catch (Throwable $e) {
            throw new RuntimeException('Cloudinary upload failed: ' . $e->getMessage(), 0, $e);
        }

        return [
            'public_id' => $result['public_id'],  // Used later to delete or transform
            'url'       => $result['secure_url'], // Full https link to the image
        ];
    }

        public function delete(string $publicId): void
    {
        try {
            $this->client->uploadApi()->destroy($publicId); // Remove the file from Cloudinary
        } catch (Throwable $e) {
            throw new RuntimeException('Cloudinary delete failed: ' . $e->getMessage(), 0, $e);
        }
    }
}
