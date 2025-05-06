<?php

use App\Http\Controllers\Admin\MerchantApplicationController;
use App\Http\Controllers\MerchantItemController;
use App\Http\Controllers\ModeController;
use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('store', function () {
        return Inertia::render('store');
    })->name('store');
});

Route::post('/switch-mode', [ModeController::class, 'switchMode'])->name('switch.mode');

Route::middleware(['auth'])->group(function () {
    Route::post('/merchant/apply', [MerchantApplicationController::class, 'store'])
        ->name('merchant.apply');
    
    // Admin routes for reviewing applications
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/merchant/applications/{application}/review', [MerchantApplicationController::class, 'review'])
            ->name('merchant.applications.review');
    });
});

Route::get('/store', [StoreController::class, 'index'])->name('store.index');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cart.php';
require __DIR__.'/search.php';
require __DIR__.'/items.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/api.php';

// Route::middleware(['auth', 'role:admin'])->group(function () {
//     Route::get('/api/merchant-applications', [MerchantApplicationController::class, 'index']);
//     Route::post('/api/merchant-applications/{application}/review', [MerchantApplicationController::class, 'review']);
//     Route::get('/dashboard/admin/approval', function () {
//         return Inertia::render('dashboard/admin/approval');
//     })->name('admin.approval');
// });

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });