<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // Group categories by their type
        $categories = Category::whereNotNull('type')
            ->get()
            ->groupBy('type');

        return response()->json($categories);
    }
}