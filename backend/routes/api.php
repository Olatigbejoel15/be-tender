<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Default Sanctum route: returns the logged-in user (used later for accounts)
Route::get('/user', fn (Request $request) => $request->user())->middleware('auth:sanctum');

// Version 1 of the public API: URLs look like /api/v1/products
Route::prefix('v1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);      // list categories
    Route::get('/products', [ProductController::class, 'index']);         // list/filter products
    Route::get('/products/{slug}', [ProductController::class, 'show']);   // one product
});
