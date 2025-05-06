<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\MerchantApplicationController;
use App\Http\Controllers\Merchant\MerchantItemController;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    // Generic dashboard redirect based on active mode
    Route::get('dashboard', function () {
        $user = auth()->user();
        $activeMode = $user->active_mode ?? $user->role;
        return redirect()->route($activeMode . '.dashboard');
    })->name('dashboard');

    // All dashboard routes under /dashboard prefix
    Route::prefix('dashboard')->group(function () {
        // Admin Routes
        Route::middleware(['role:admin'])->prefix('admin')->group(function () {
            Route::get('/', function () {
                return Inertia::render('dashboard/admin/index');
            })->name('admin.dashboard');

            Route::get('/approval', function () {
                return Inertia::render('dashboard/admin/approval');
            })->name('admin.approval');

            Route::get('/management', function () {
                return Inertia::render('dashboard/admin/management');
            })->name('admin.management');

            Route::patch('/dashboard/admin/api/users/{user}', [UserController::class, 'update']);

            // Admin API routes
            Route::prefix('api')->group(function () {
                Route::get('/users', [UserController::class, 'index']);
                Route::patch('/users/{user}', [UserController::class, 'update']);
                Route::delete('/users/{user}', [UserController::class, 'destroy']);
                Route::get('/merchant-applications', [MerchantApplicationController::class, 'index']);
                Route::post('/merchant-applications/{application}/review', [MerchantApplicationController::class, 'review']);
            });
        });

        // Merchant Routes
        Route::middleware(['role:merchant'])->prefix('merchant')->group(function () {
            Route::get('/', function () {
                return Inertia::render('dashboard/merchant/index');
            })->name('merchant.dashboard');

            Route::get('/stocking', function () {
                return Inertia::render('dashboard/merchant/stocking');
            })->name('merchant.stocking');

            Route::get('/shipping', function () {
                return Inertia::render('dashboard/merchant/shipping');
            })->name('merchant.shipping');

            // Merchant API routes
            Route::prefix('api')->group(function () {
                Route::post('/items', [MerchantItemController::class, 'store']);
            });
        });

        // User Routes
        Route::prefix('user')->group(function () {
            Route::get('/', function () {
                return Inertia::render('dashboard/user/index');
            })->name('user.dashboard');

            Route::get('/checkout', function () {
                return Inertia::render('dashboard/user/checkout');
            })->name('user.checkout');

            Route::get('/order-status', function () {
                return Inertia::render('dashboard/user/order-status');
            })->name('user.order-status');
        });
    });
});