<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\StockController as AdminStockController;
use App\Http\Controllers\Api\V1\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\V1\Admin\StaffController as AdminStaffController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Resources\UserResource;

// Default Sanctum route: returns the logged-in user (used later for accounts)
Route::get('/user', fn (Request $request) => $request->user())->middleware('auth:sanctum');

// Version 1 of the public API: URLs look like /api/v1/products
Route::prefix('v1')->group(function () {
    // Public catalogue: browsers may reuse a response for 60s, and answer "304 Not Modified" via the ETag
    Route::middleware('cache.headers:public;max_age=60;etag')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{slug}', [ProductController::class, 'show']);
    });
    Route::post('/webhooks/paystack', [PaymentController::class, 'webhook']); // Paystack calls this itself

    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1'); // 10 tries a minute
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');        // 5 tries a minute

    // Everything under /api/v1/admin needs a login AND a staff role
    Route::prefix('admin')->middleware(['auth:sanctum', 'staff'])->group(function () {
        Route::get('/me', fn (Request $request) => new UserResource($request->user())); // Who am I (staff view)

        Route::get('/orders', [AdminOrderController::class, 'index']);                             // List + filter
        Route::get('/orders/{reference}', [AdminOrderController::class, 'show']);                  // One order
        Route::patch('/orders/{reference}/status', [AdminOrderController::class, 'updateStatus']); // Change stage

        Route::get('/products', [AdminProductController::class, 'index']);                          // List (drafts included)
        Route::post('/products', [AdminProductController::class, 'store']);                         // Create
        Route::get('/products/{id}', [AdminProductController::class, 'show'])->whereNumber('id');
        Route::patch('/products/{id}', [AdminProductController::class, 'update'])->whereNumber('id');   // Edit
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy'])->whereNumber('id'); // Soft delete
        Route::post('/products/{id}/photos', [AdminProductController::class, 'storePhoto'])->whereNumber('id');
        Route::delete('/products/{id}/photos/{photoId}', [AdminProductController::class, 'destroyPhoto'])->whereNumber(['id', 'photoId']);

        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('can:manage-staff'); // Super admin only

        Route::get('/products/{id}/stock', [AdminStockController::class, 'show'])->whereNumber('id');    // Stock matrix
        Route::patch('/products/{id}/stock', [AdminStockController::class, 'update'])->whereNumber('id'); // Set / add stock
        Route::get('/stock/low', [AdminStockController::class, 'low']);                                    // Running low

        Route::prefix('analytics')->group(function () {
            Route::get('/summary', [AdminAnalyticsController::class, 'summary']);          // Totals + comparison
            Route::get('/revenue', [AdminAnalyticsController::class, 'revenue']);          // Daily chart data
            Route::get('/top-products', [AdminAnalyticsController::class, 'topProducts']); // Best sellers
        });

        Route::middleware('can:manage-staff')->prefix('staff')->group(function () {              // Super admin only
            Route::get('/', [AdminStaffController::class, 'index']);                             // List staff
            Route::post('/', [AdminStaffController::class, 'store']);                            // Create / promote
            Route::patch('/{id}', [AdminStaffController::class, 'update'])->whereNumber('id');   // Role / active
        });
    });

    // Guests and signed-in customers share these (guests prove ownership with the order's email)
    Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:6,1');                          // Place an order
    Route::post('/orders/{reference}/lookup', [OrderController::class, 'lookup'])->middleware('throttle:15,1');     // Track an order
    Route::post('/orders/{reference}/pay', [PaymentController::class, 'pay'])->middleware('throttle:10,1');         // Start payment
    Route::post('/orders/{reference}/confirm', [PaymentController::class, 'confirm'])->middleware('throttle:20,1'); // Check payment

    // Account-only routes: a valid token is required
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/orders', [OrderController::class, 'index']);                // My orders
        Route::get('/orders/{reference}', [OrderController::class, 'show']);     // One of my orders
    });
});
