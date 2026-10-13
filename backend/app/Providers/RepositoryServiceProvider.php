<?php

namespace App\Providers;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Eloquent\CategoryRepository;
use App\Repositories\Eloquent\ProductRepository;
use Illuminate\Support\ServiceProvider;
use App\Services\Contracts\ImageUploaderInterface;
use App\Services\Images\CloudinaryImageUploader;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Eloquent\OrderRepository;

class RepositoryServiceProvider extends ServiceProvider
{



    // "When something asks for the interface, give it this class"
    public array $bindings = [
        ImageUploaderInterface::class => CloudinaryImageUploader::class, // Cloudinary is the uploader
        ProductRepositoryInterface::class => ProductRepository::class,
        CategoryRepositoryInterface::class => CategoryRepository::class,
        UserRepositoryInterface::class => UserRepository::class, // Users come from Eloquent
        OrderRepositoryInterface::class => OrderRepository::class, // Orders come from Eloquent
    ];
}
