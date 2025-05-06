<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderReceipt;


class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_first_name' => 'required|string|max:255',
            'shipping_last_name' => 'required|string|max:255',
            'shipping_address' => 'required|string|max:255',
            'shipping_property' => 'nullable|string|max:255',
            'shipping_country_id' => 'required|exists:countries,id',
            'shipping_state_id' => 'required|exists:states,id',
            'shipping_city_id' => 'required|exists:cities,id',
            'shipping_zip_postal_code' => 'required|string|max:20',
            'shipping_phone' => 'required|string|max:20',
            'shipping_email' => 'required|email|max:255',
            'payment_method' => 'required|in:card,cash',
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        $order = Order::create([
            'user_id' => auth()->id(),
            'status' => 'pending',
            'total' => $validated['total'],
            'payment_method' => $validated['payment_method'],
            'shipping_first_name' => $validated['shipping_first_name'],
            'shipping_last_name' => $validated['shipping_last_name'],
            'shipping_address' => $validated['shipping_address'],
            'shipping_property' => $validated['shipping_property'],
            'shipping_country_id' => $validated['shipping_country_id'],
            'shipping_state_id' => $validated['shipping_state_id'],
            'shipping_city_id' => $validated['shipping_city_id'],
            'shipping_zip_postal_code' => $validated['shipping_zip_postal_code'],
            'shipping_phone' => $validated['shipping_phone'],
            'shipping_email' => $validated['shipping_email'],
        ]);

        // Create order items
        foreach ($validated['items'] as $item) {
            $order->items()->create([
                'item_id' => $item['item_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        return response()->json([
            'success' => true,
            'order' => $order->load('items'),
        ]);
    }

    public function index()
    {
        $orders = Order::with(['items.item'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function cancel(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order cannot be cancelled'], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json(['success' => true]);
    }

    public function merchantOrders()
    {
        // Get orders that contain items from the merchant
        $merchantId = auth()->id();
        
        $orders = Order::with(['items.item'])
            ->whereHas('items.item', function($query) use ($merchantId) {
                $query->where('merchant_id', $merchantId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        // Verify merchant owns at least one item in the order
        $merchantId = auth()->id();
        $hasItems = $order->items()->whereHas('item', function($query) use ($merchantId) {
            $query->where('merchant_id', $merchantId);
        })->exists();

        if (!$hasItems) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->update(['status' => $validated['status']]);

        return response()->json(['success' => true]);
    }

    public function sendReceipt(Order $order): JsonResponse
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    
        try {
            \Log::info('Attempting to send receipt for order: ' . $order->id);
            
            // Load necessary relationships if not already loaded
            $order->load('items.item');
            
            Mail::to($order->shipping_email)->send(new OrderReceipt($order));
            
            \Log::info('Receipt sent successfully');
            return response()->json(['message' => 'Receipt sent successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to send receipt email: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Failed to send receipt',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}