<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = $request->input('query');
            $categories = $request->input('categories', []);

            $itemsQuery = Item::query();

            // Apply search filter if query parameter exists
            if ($query) {
                $itemsQuery->where(function($q) use ($query) {
                    $q->where('name', 'like', '%' . trim($query) . '%')
                      ->orWhere('description', 'like', '%' . trim($query) . '%');
                });
            }

            // Apply category filter if categories parameter exists
            if (!empty($categories)) {
                $itemsQuery->whereHas('categories', function($q) use ($categories) {
                    $q->whereIn('id', $categories);
                });
            }

            // Always eager load categories to prevent N+1 queries
            $items = $itemsQuery->with('categories')->get();

            return response()->json($items);

        } catch (\Exception $e) {
            \Log::error('Search error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'error' => 'Search failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}