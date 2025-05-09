<?php

namespace App\Http\Controllers\Merchant;

use App\Models\Item;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MerchantItemController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'image_url' => 'nullable|string|url',
                'categories' => 'nullable|array',
                'categories.*' => 'exists:categories,id',
                'merchant_id' => 'required|exists:users,id'
            ]);

            \DB::beginTransaction();
            
            $item = Item::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'image_url' => $validated['image_url'],
                'merchant_id' => $validated['merchant_id']
            ]);

            if (!empty($validated['categories'])) {
                $item->categories()->attach($validated['categories']);
            }

            \DB::commit();

            return response()->json([
                'message' => 'Item added successfully',
                'item' => $item->load('categories')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \DB::rollBack();
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Item creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create item',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function updateStock(Item $item, Request $request)
    {
        try {
            $validated = $request->validate([
                'stock' => 'required|integer|min:0',
            ]);

            $item->update([
                'stock' => $validated['stock']
            ]);

            return response()->json([
                'message' => 'Stock updated successfully',
                'item' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = Item::query()
            ->with('categories')
            ->where('merchant_id', auth()->id()); // Use authenticated user's ID
        
        return $query->get();
    }
}