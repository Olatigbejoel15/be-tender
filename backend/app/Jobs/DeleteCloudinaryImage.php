<?php

namespace App\Jobs;

// keep the generated use lines (ShouldQueue, Queueable...), then add:
use App\Services\Images\ImageUploaderInterface; // <-- copy the real namespace from AdminProductService

class DeleteCloudinaryImage implements ShouldQueue
{
    // keep the generated "use Queueable;" line here

    public int $tries = 3;                       // Retry if Cloudinary is down
    public array $backoff = [10, 60, 300];       // Seconds between attempts

    public function __construct(public string $publicId) {} // Which image to remove

    public function handle(ImageUploaderInterface $images): void
    {
        $images->delete($this->publicId);
    }
}
