<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .items { margin: 20px 0; }
        .total { font-weight: bold; margin-top: 20px; }
        .shipping { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Order Receipt</h1>
        <p>Order #{{ $order->id }}</p>
        <p>Date: {{ $order->created_at->format('M d, Y') }}</p>
    </div>

    <div class="items">
        <h3>Items:</h3>
        @foreach($order->items as $item)
            <div>
                {{ $item->item->name }} x {{ $item->quantity }} - ${{ number_format($item->price * $item->quantity, 2) }}
            </div>
        @endforeach
    </div>

    <div class="total">
        Total: ${{ number_format($order->total, 2) }}
    </div>

    <div class="shipping">
        <h3>Shipping Details:</h3>
        <p>
            {{ $order->shipping_first_name }} {{ $order->shipping_last_name }}<br>
            {{ $order->shipping_address }}
        </p>
    </div>

    <div class="payment">
        <h3>Payment Method:</h3>
        <p>{{ strtoupper($order->payment_method) }}</p>
    </div>
</body>
</html>