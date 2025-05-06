<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\Merchant\MerchantItemController;
use App\Http\Controllers\OrderController;
use App\Http\Middleware\HandleApiErrors;
use Illuminate\Support\Facades\Route;


Route::get('/api/cart', [CartController::class, 'index']);
Route::delete('/api/cart', [CartController::class, 'clear']);

// Order routes
Route::post('/api/orders', [OrderController::class, 'store']);
Route::get('/api/orders', [OrderController::class, 'index'])->middleware('auth');
Route::post('/api/orders/{order}/cancel', [OrderController::class, 'cancel'])->middleware('auth');

Route::middleware(['auth', 'role:merchant'])->group(function () {
    Route::get('/api/merchant/orders', [OrderController::class, 'merchantOrders']);
    Route::post('/api/merchant/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('api/merchant/items', [MerchantItemController::class, 'store'])
    ->middleware(HandleApiErrors::class);
});

Route::post('/api/orders/{order}/send-receipt', [OrderController::class, 'sendReceipt'])->middleware('auth');

// Merchant specific routes
Route::patch('api/merchant/items/{item}/stock',[MerchantItemController::class, 'updateStock']);
Route::get('api/merchant/items', [MerchantItemController::class, 'index']);
    
// General routes
Route::middleware(['auth'])->group(function () {
    Route::get('api/merchant/items', [MerchantItemController::class, 'index']);
});

Route::delete('api/merchant/items/{item}', [ItemController::class,'destroy']);