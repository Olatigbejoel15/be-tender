<?php

namespace App\Providers;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Eloquent\CategoryRepository;
use App\Repositories\Eloquent\ProductRepository;
use Illuminate\Support\ServiceProvider;
use App\Services\Contracts\ImageUploaderInterface;
use App\Services\Images\CloudinaryImageUploader;

class RepositoryServiceProvider extends ServiceProvider
{



    // "When something asks for the interface, give it this class"
    public array $bindings = [
        ImageUploaderInterface::class => CloudinaryImageUploader::class, // Cloudinary is the uploader
        ProductRepositoryInterface::class => ProductRepository::class,
        CategoryRepositoryInterface::class => CategoryRepository::class,
    ];
}
