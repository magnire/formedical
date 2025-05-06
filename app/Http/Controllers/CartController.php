<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Item;

class CartController extends Controller
{
    public function add(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
        ]);

        $cartItem = Cart::firstOrCreate(
            ['user_id' => auth()->id(), 'item_id' => $request->item_id],
            ['quantity' => 0]
        );

        $cartItem->quantity += 1;
        $cartItem->save();

        return response()->json(['success' => true, 'cartItem' => $cartItem]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:0',
        ]);

        $cartItem = Cart::where('user_id', auth()->id())
            ->where('item_id', $request->item_id)
            ->first();

        if ($cartItem) {
            if ($request->quantity === 0) {
                $cartItem->delete();
            } else {
                $cartItem->quantity = $request->quantity;
                $cartItem->save();
            }
        }

        return response()->json(['success' => true, 'cartItem' => $cartItem]);
    }

    public function index()
    {
        $cartItems = Cart::where('user_id', auth()->id())
            ->with('item')
            ->get()
            ->map(function ($cartItem) {
                return [
                    'id' => $cartItem->item_id,
                    'name' => $cartItem->item->name,
                    'price' => $cartItem->item->price,
                    'quantity' => $cartItem->quantity,
                    'image_url' => $cartItem->item->image_url
                ];
            });

        return response()->json($cartItems);
    }

    public function clear()
    {
        Cart::where('user_id', auth()->id())->delete();
        
        return response()->json(['success' => true]);
    }
}
