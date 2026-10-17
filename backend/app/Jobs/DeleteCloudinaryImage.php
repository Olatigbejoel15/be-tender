<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use App\Services\Contracts\ImageUploaderInterface;



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
