<?php

use App\Http\Controllers\ItemController;
use Illuminate\Support\Facades\Route;

Route::get('/api/items', [ItemController::class, 'index'])->name('api.items.index');

Route::get('/store/items/{item}', [ItemController::class, 'show'])->name('store.items.show');