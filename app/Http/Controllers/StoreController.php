<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index()
    {
        $items = Item::with('categories')->get();
        
        return Inertia::render('store', [
            'items' => $items
        ]);
    }
}
