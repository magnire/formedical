<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('cart', function () {
        return inertia::render('cart');
    })->name('cart');

    Route::get('/user/checkout', function () {
        return Inertia::render('dashboard/user/checkout');
    })->name('user.checkout');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
    Route::get('/api/cart', [CartController::class, 'index'])->name('cart.index'); 
});