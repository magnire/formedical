<?php

use App\Http\Controllers\SearchController;
use App\Http\Controllers\CategoryController;

Route::get('/api/search', [SearchController::class, 'search'])->name('api.search');

Route::get('/admin/categories', [CategoryController::class, 'index'])->name('admin.categories.index');

Route::prefix('api')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
});