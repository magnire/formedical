<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{   
    public function index()
    {
        $items = Item::with('categories')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        // Return in the format the frontend expects
        return response()->json([
            'data' => $items,
            'current_page' => 1,
            'total' => $items->count(),
            // Add other pagination fields to match PaginatedResponse interface
            'first_page_url' => null,
            'from' => 1,
            'last_page' => 1,
            'last_page_url' => null,
            'links' => [],
            'next_page_url' => null,
            'path' => '/api/items',
            'per_page' => $items->count(),
            'prev_page_url' => null,
            'to' => $items->count()
        ]);
    }

    public function show(Item $item)
    {
        return inertia('item-detail', [
            'item' => $item->load('categories')
        ]);
    }
}
