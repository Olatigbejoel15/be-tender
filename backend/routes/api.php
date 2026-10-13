<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Default Sanctum route: returns the logged-in user (used later for accounts)
Route::get('/user', fn (Request $request) => $request->user())->middleware('auth:sanctum');

// Version 1 of the public API: URLs look like /api/v1/products
Route::prefix('v1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);      // list categories
    Route::get('/products', [ProductController::class, 'index']);         // list/filter products
    Route::get('/products/{slug}', [ProductController::class, 'show']);   // one product

    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1'); // 10 tries a minute
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');        // 5 tries a minute

    Route::middleware('auth:sanctum')->group(function () { // everything inside needs a valid token
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        Route::post('/orders', [OrderController::class, 'store']);               // place an order
        Route::get('/orders', [OrderController::class, 'index']);                // my orders
        Route::get('/orders/{reference}', [OrderController::class, 'show']);     // one of my orders
    });

});
